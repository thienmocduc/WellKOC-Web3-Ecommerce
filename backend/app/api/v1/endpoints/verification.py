"""
WellKOC — Account Verification Endpoints
Ensures 1 person = 1 account via phone, bank, and identity verification.

POST /verify/phone/send-otp
POST /verify/phone/confirm
POST /verify/bank
POST /verify/bank/micro-deposit
POST /verify/identity
PUT  /verify/identity/{user_id}/review
GET  /verify/status
GET  /verify/check-duplicate
"""
import logging
import re
import secrets
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.redis_client import get_redis
from app.api.v1.deps import CurrentUser, require_role
from app.models.user import User, UserRole
from app.services.duplicate_detector import DuplicateDetector
from app.services.vneid_service import VNeIDService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/verify", tags=["Verification"])


# ── Schemas ──────────────────────────────────────────────────

class PhoneSendOTPRequest(BaseModel):
    phone: str = Field(..., min_length=9, max_length=15, description="Số điện thoại")


class PhoneConfirmRequest(BaseModel):
    phone: str = Field(..., min_length=9, max_length=15)
    otp: str = Field(..., min_length=6, max_length=6)


class BankVerifyRequest(BaseModel):
    bank_name: str = Field(..., min_length=1, max_length=100)
    bank_account_number: str = Field(..., min_length=5, max_length=30)
    bank_account_holder: str = Field(..., min_length=1, max_length=200)


class MicroDepositInitRequest(BaseModel):
    bank_name: str = Field(..., min_length=1, max_length=100)
    bank_account_number: str = Field(..., min_length=5, max_length=30)
    bank_account_holder: str = Field(..., min_length=1, max_length=200)


class MicroDepositConfirmRequest(BaseModel):
    amount_1: int = Field(..., ge=100, le=999)
    amount_2: int = Field(..., ge=100, le=999)


class IdentitySubmitRequest(BaseModel):
    identity_number: str = Field(..., min_length=9, max_length=12)
    full_name: str = Field(..., min_length=2, max_length=200)
    date_of_birth: str = Field(..., description="YYYY-MM-DD")
    front_image_url: str
    back_image_url: str


class IdentityReviewRequest(BaseModel):
    action: str  # approve | reject
    reason: Optional[str] = None


# ── Helpers ──────────────────────────────────────────────────

def _normalize_vietnamese(name: str) -> str:
    """Normalize Vietnamese name for fuzzy matching:
    lowercase, strip diacritics, collapse whitespace."""
    import unicodedata
    name = name.strip().lower()
    # Normalize unicode
    name = unicodedata.normalize("NFD", name)
    # Remove combining diacritical marks
    name = "".join(c for c in name if unicodedata.category(c) != "Mn")
    # Collapse whitespace
    name = re.sub(r"\s+", " ", name).strip()
    # Handle đ -> d
    name = name.replace("đ", "d").replace("Đ", "d")
    return name


def _names_match(name1: str, name2: str) -> bool:
    """Fuzzy match two Vietnamese names."""
    return _normalize_vietnamese(name1) == _normalize_vietnamese(name2)


def _compute_verification_level(user: User) -> int:
    """Compute verification level based on verified fields."""
    if user.email_verified and user.phone_verified and user.identity_verified and user.bank_verified:
        return 5  # full
    if user.email_verified and user.phone_verified and user.identity_verified and user.bank_verified:
        return 5
    if user.bank_verified and user.identity_verified and user.phone_verified and user.email_verified:
        return 5
    # Check each level in order
    level = 0
    if user.email_verified:
        level = 1
    if level >= 1 and user.phone_verified:
        level = 2
    if level >= 2 and user.identity_verified:
        level = 3
    if level >= 3 and user.bank_verified:
        level = 4
    if level >= 4:
        level = 5
    return level


def _validate_identity_number(identity_number: str) -> bool:
    """Validate CCCD (12 digits) or CMND (9 digits) format."""
    cleaned = identity_number.strip()
    return bool(re.match(r"^\d{9}$", cleaned) or re.match(r"^\d{12}$", cleaned))


# ══════════════════════════════════════════════════════════════
#  POST /verify/phone/send-otp — Send OTP to phone
# ══════════════════════════════════════════════════════════════

@router.post("/phone/send-otp")
async def phone_send_otp(
    body: PhoneSendOTPRequest,
    current_user: CurrentUser = None,
    db: AsyncSession = Depends(get_db),
):
    """Gửi OTP xác minh số điện thoại. Kiểm tra số chưa được dùng bởi tài khoản khác."""
    phone = body.phone.strip()

    # Check if phone already used by another account
    detector = DuplicateDetector(db)
    dup = await detector.check_phone_duplicate(phone, current_user.id)
    if dup:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Số điện thoại đã được sử dụng bởi tài khoản khác",
        )

    # Generate 6-digit OTP
    otp_code = str(secrets.randbelow(900000) + 100000)

    # Store in Redis with 5min TTL
    redis = await get_redis()
    otp_key = f"verify:phone:{current_user.id}:{phone}"
    await redis.set(otp_key, otp_code, ex=300)

    # TODO: Send SMS via Twilio/ZNS in production
    logger.info("OTP sent to %s for user %s (mock): %s", phone, current_user.id, otp_code)

    return {
        "message": "OTP đã được gửi đến số điện thoại của bạn",
        "expires_in": 300,
        "phone": phone,
    }


# ══════════════════════════════════════════════════════════════
#  POST /verify/phone/confirm — Confirm phone OTP
# ══════════════════════════════════════════════════════════════

@router.post("/phone/confirm")
async def phone_confirm(
    body: PhoneConfirmRequest,
    current_user: CurrentUser = None,
    db: AsyncSession = Depends(get_db),
):
    """Xác nhận OTP điện thoại. Cập nhật trạng thái xác minh."""
    phone = body.phone.strip()

    # Validate OTP from Redis
    redis = await get_redis()
    otp_key = f"verify:phone:{current_user.id}:{phone}"
    stored_otp = await redis.get(otp_key)

    if not stored_otp or stored_otp != body.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP không hợp lệ hoặc đã hết hạn",
        )

    # Delete OTP after successful verification
    await redis.delete(otp_key)

    now = datetime.now(timezone.utc)
    current_user.phone = phone
    current_user.phone_verified = True
    current_user.phone_verified_at = now
    current_user.verification_level = _compute_verification_level(current_user)
    db.add(current_user)
    await db.commit()

    logger.info("Phone verified for user %s: %s", current_user.id, phone)

    return {
        "message": "Số điện thoại đã được xác minh thành công",
        "phone": phone,
        "phone_verified": True,
        "verification_level": current_user.verification_level,
    }


# ══════════════════════════════════════════════════════════════
#  POST /verify/bank — Verify bank account
# ══════════════════════════════════════════════════════════════

@router.post("/bank")
async def verify_bank(
    body: BankVerifyRequest,
    current_user: CurrentUser = None,
    db: AsyncSession = Depends(get_db),
):
    """Xác minh tài khoản ngân hàng. Kiểm tra trùng lặp và khớp tên."""
    # Check bank_account_number not already used
    detector = DuplicateDetector(db)
    dup = await detector.check_bank_duplicate(body.bank_account_number, current_user.id)
    if dup:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Số tài khoản ngân hàng đã được sử dụng bởi tài khoản khác",
        )

    # Check bank_account_holder matches user's full_name (fuzzy match)
    if current_user.full_name and not _names_match(body.bank_account_holder, current_user.full_name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên chủ tài khoản không khớp với tên đăng ký",
        )

    now = datetime.now(timezone.utc)
    current_user.bank_name = body.bank_name
    current_user.bank_account_number = body.bank_account_number
    current_user.bank_account_holder = body.bank_account_holder
    current_user.bank_verified = True
    current_user.bank_verified_at = now
    current_user.verification_level = _compute_verification_level(current_user)
    db.add(current_user)
    await db.commit()

    logger.info("Bank verified for user %s: %s", current_user.id, body.bank_name)

    return {
        "message": "Tài khoản ngân hàng đã được xác minh thành công",
        "bank_name": body.bank_name,
        "bank_verified": True,
        "verification_level": current_user.verification_level,
    }


# ══════════════════════════════════════════════════════════════
#  POST /verify/bank/micro-deposit — Verify bank via micro-deposit
# ══════════════════════════════════════════════════════════════

@router.post("/bank/micro-deposit")
async def bank_micro_deposit_init(
    body: MicroDepositInitRequest,
    current_user: CurrentUser = None,
    db: AsyncSession = Depends(get_db),
):
    """Gửi 2 khoản tiền nhỏ (100-999 VND) để xác minh quyền sở hữu tài khoản ngân hàng."""
    # Check bank_account_number not already used
    detector = DuplicateDetector(db)
    dup = await detector.check_bank_duplicate(body.bank_account_number, current_user.id)
    if dup:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Số tài khoản ngân hàng đã được sử dụng bởi tài khoản khác",
        )

    # Generate two micro-deposit amounts
    amount_1 = secrets.randbelow(900) + 100  # 100-999
    amount_2 = secrets.randbelow(900) + 100

    # Store in Redis with 24h TTL
    redis = await get_redis()
    deposit_key = f"verify:microdeposit:{current_user.id}"
    await redis.hset(deposit_key, mapping={
        "amount_1": str(amount_1),
        "amount_2": str(amount_2),
        "bank_name": body.bank_name,
        "bank_account_number": body.bank_account_number,
        "bank_account_holder": body.bank_account_holder,
    })
    await redis.expire(deposit_key, 86400)  # 24 hours

    # TODO: Integrate with bank API to send actual micro-deposits in production
    logger.info(
        "Micro-deposit initiated for user %s: %d VND, %d VND",
        current_user.id, amount_1, amount_2,
    )

    return {
        "message": "Hai khoản tiền nhỏ đã được gửi đến tài khoản ngân hàng của bạn. "
                   "Vui lòng xác nhận chính xác 2 số tiền để hoàn tất xác minh.",
        "bank_name": body.bank_name,
        "bank_account_number": body.bank_account_number[-4:].rjust(len(body.bank_account_number), "*"),
        "expires_in": 86400,
    }


@router.post("/bank/micro-deposit/confirm")
async def bank_micro_deposit_confirm(
    body: MicroDepositConfirmRequest,
    current_user: CurrentUser = None,
    db: AsyncSession = Depends(get_db),
):
    """Xác nhận 2 khoản tiền nhỏ để hoàn tất xác minh tài khoản ngân hàng."""
    redis = await get_redis()
    deposit_key = f"verify:microdeposit:{current_user.id}"
    stored = await redis.hgetall(deposit_key)

    if not stored:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không tìm thấy yêu cầu xác minh. Vui lòng gửi lại micro-deposit.",
        )

    stored_amount_1 = int(stored["amount_1"])
    stored_amount_2 = int(stored["amount_2"])

    if body.amount_1 != stored_amount_1 or body.amount_2 != stored_amount_2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Số tiền không chính xác. Vui lòng kiểm tra lại.",
        )

    # Clean up Redis
    await redis.delete(deposit_key)

    # Check name match
    if current_user.full_name and not _names_match(stored["bank_account_holder"], current_user.full_name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên chủ tài khoản không khớp với tên đăng ký",
        )

    now = datetime.now(timezone.utc)
    current_user.bank_name = stored["bank_name"]
    current_user.bank_account_number = stored["bank_account_number"]
    current_user.bank_account_holder = stored["bank_account_holder"]
    current_user.bank_verified = True
    current_user.bank_verified_at = now
    current_user.verification_level = _compute_verification_level(current_user)
    db.add(current_user)
    await db.commit()

    logger.info("Bank verified via micro-deposit for user %s", current_user.id)

    return {
        "message": "Tài khoản ngân hàng đã được xác minh thành công qua micro-deposit",
        "bank_verified": True,
        "verification_level": current_user.verification_level,
    }


# ══════════════════════════════════════════════════════════════
#  POST /verify/identity — Submit identity verification (CCCD)
# ══════════════════════════════════════════════════════════════

@router.post("/identity")
async def submit_identity(
    body: IdentitySubmitRequest,
    current_user: CurrentUser = None,
    db: AsyncSession = Depends(get_db),
):
    """Gửi thông tin CCCD/CMND để xác minh danh tính. Admin sẽ duyệt sau."""
    identity_number = body.identity_number.strip()

    # Validate identity_number format
    if not _validate_identity_number(identity_number):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Số CCCD phải có 12 chữ số hoặc CMND phải có 9 chữ số",
        )

    # Check identity_number not already used
    detector = DuplicateDetector(db)
    dup = await detector.check_identity_duplicate(identity_number, current_user.id)
    if dup:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Số CCCD/CMND đã được sử dụng bởi tài khoản khác",
        )

    # Parse date_of_birth
    from datetime import date as date_type
    try:
        dob = date_type.fromisoformat(body.date_of_birth)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ngày sinh không hợp lệ. Định dạng: YYYY-MM-DD",
        )

    # Store identity info — pending admin review
    current_user.identity_number = identity_number
    current_user.full_name = body.full_name
    current_user.date_of_birth = dob
    current_user.identity_verified = False  # pending review

    # Store image URLs in kyc_data
    kyc_data = current_user.kyc_data or {}
    kyc_data.update({
        "identity_front_url": body.front_image_url,
        "identity_back_url": body.back_image_url,
        "identity_submitted_at": datetime.now(timezone.utc).isoformat(),
    })
    current_user.kyc_data = kyc_data
    current_user.kyc_status = "processing"

    db.add(current_user)
    await db.commit()

    logger.info("Identity submitted for user %s: %s", current_user.id, identity_number)

    return {
        "message": "Thông tin CCCD/CMND đã được gửi. Admin sẽ xác minh trong 24-48 giờ.",
        "identity_number": identity_number[:3] + "*" * (len(identity_number) - 6) + identity_number[-3:],
        "identity_verified": False,
        "status": "pending_review",
    }


# ══════════════════════════════════════════════════════════════
#  PUT /verify/identity/{user_id}/review — Admin reviews identity
# ══════════════════════════════════════════════════════════════

@router.put("/identity/{user_id}/review")
async def review_identity(
    user_id: uuid.UUID,
    body: IdentityReviewRequest,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Admin duyệt hoặc từ chối xác minh danh tính."""
    if body.action not in ("approve", "reject"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Action phải là 'approve' hoặc 'reject'",
        )

    # Find target user
    r = await db.execute(select(User).where(User.id == user_id))
    target_user = r.scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")

    if not target_user.identity_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Người dùng chưa gửi thông tin CCCD/CMND",
        )

    now = datetime.now(timezone.utc)
    kyc_data = target_user.kyc_data or {}

    if body.action == "approve":
        target_user.identity_verified = True
        target_user.identity_verified_at = now
        target_user.kyc_status = "approved"
        kyc_data["identity_approved_by"] = str(current_user.id)
        kyc_data["identity_approved_at"] = now.isoformat()
        kyc_data.pop("identity_reject_reason", None)
        target_user.verification_level = _compute_verification_level(target_user)
    else:
        if not body.reason:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cần cung cấp lý do từ chối",
            )
        target_user.identity_verified = False
        target_user.kyc_status = "rejected"
        kyc_data["identity_reject_reason"] = body.reason
        kyc_data["identity_rejected_by"] = str(current_user.id)
        kyc_data["identity_rejected_at"] = now.isoformat()

    target_user.kyc_data = kyc_data
    target_user.kyc_reviewed_at = now
    target_user.kyc_reviewer_id = current_user.id
    db.add(target_user)
    await db.commit()

    logger.info(
        "Identity %s for user %s by admin %s",
        body.action, user_id, current_user.id,
    )

    return {
        "message": f"Xác minh danh tính đã được {body.action}",
        "user_id": str(user_id),
        "identity_verified": target_user.identity_verified,
        "verification_level": target_user.verification_level,
        "reviewed_at": now.isoformat(),
    }


# ══════════════════════════════════════════════════════════════
#  GET /verify/status — Get current user's verification status
# ══════════════════════════════════════════════════════════════

LEVEL_DESCRIPTIONS = {
    0: "Chưa xác minh",
    1: "Email đã xác minh",
    2: "Điện thoại đã xác minh",
    3: "Danh tính đã xác minh",
    4: "Ngân hàng đã xác minh",
    5: "Xác minh đầy đủ",
}

LEVEL_PERMISSIONS = {
    0: ["Duyệt sản phẩm"],
    1: ["Duyệt sản phẩm", "Danh sách yêu thích"],
    2: ["Duyệt sản phẩm", "Danh sách yêu thích", "Mua hàng"],
    3: ["Duyệt sản phẩm", "Danh sách yêu thích", "Mua hàng", "Trở thành KOC"],
    4: ["Duyệt sản phẩm", "Danh sách yêu thích", "Mua hàng", "Trở thành KOC", "Rút tiền"],
    5: ["Toàn quyền truy cập"],
}


@router.get("/status")
async def get_verification_status(current_user: CurrentUser = None):
    """Trả về trạng thái xác minh hiện tại và hướng dẫn bước tiếp theo."""
    level = current_user.verification_level

    # Determine next steps
    missing = []
    if not current_user.email_verified:
        missing.append({"step": "email", "label": "Xác minh email"})
    if not current_user.phone_verified:
        missing.append({"step": "phone", "label": "Xác minh số điện thoại"})
    if not current_user.identity_verified:
        missing.append({"step": "identity", "label": "Xác minh CCCD/CMND"})
    if not current_user.bank_verified:
        missing.append({"step": "bank", "label": "Xác minh tài khoản ngân hàng"})

    return {
        "email_verified": current_user.email_verified,
        "phone_verified": current_user.phone_verified,
        "phone_verified_at": (
            current_user.phone_verified_at.isoformat()
            if current_user.phone_verified_at else None
        ),
        "identity_verified": current_user.identity_verified,
        "identity_verified_at": (
            current_user.identity_verified_at.isoformat()
            if current_user.identity_verified_at else None
        ),
        "bank_verified": current_user.bank_verified,
        "bank_verified_at": (
            current_user.bank_verified_at.isoformat()
            if current_user.bank_verified_at else None
        ),
        "verification_level": level,
        "level_description": LEVEL_DESCRIPTIONS.get(level, "Không xác định"),
        "permissions": LEVEL_PERMISSIONS.get(level, []),
        "missing_steps": missing,
        "is_fully_verified": level >= 5,
    }


# ══════════════════════════════════════════════════════════════
#  GET /verify/check-duplicate — Check if phone/bank/identity exists
# ══════════════════════════════════════════════════════════════

@router.get("/check-duplicate")
async def check_duplicate(
    phone: Optional[str] = Query(None, description="Số điện thoại cần kiểm tra"),
    bank_account: Optional[str] = Query(None, description="Số tài khoản ngân hàng"),
    identity_number: Optional[str] = Query(None, description="Số CCCD/CMND"),
    current_user: CurrentUser = None,
    db: AsyncSession = Depends(get_db),
):
    """Kiểm tra trùng lặp real-time cho form validation."""
    detector = DuplicateDetector(db)
    result = {}

    if phone:
        dup = await detector.check_phone_duplicate(phone.strip(), current_user.id)
        result["phone"] = {
            "value": phone,
            "is_taken": dup is not None,
            "message": "Số điện thoại đã được sử dụng" if dup else "Số điện thoại có thể sử dụng",
        }

    if bank_account:
        dup = await detector.check_bank_duplicate(bank_account.strip(), current_user.id)
        result["bank_account"] = {
            "value": bank_account,
            "is_taken": dup is not None,
            "message": "Số tài khoản đã được sử dụng" if dup else "Số tài khoản có thể sử dụng",
        }

    if identity_number:
        dup = await detector.check_identity_duplicate(identity_number.strip(), current_user.id)
        result["identity_number"] = {
            "value": identity_number,
            "is_taken": dup is not None,
            "message": "Số CCCD/CMND đã được sử dụng" if dup else "Số CCCD/CMND có thể sử dụng",
        }

    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cần cung cấp ít nhất một tham số: phone, bank_account, hoặc identity_number",
        )

    return result


# ══════════════════════════════════════════════════════════════
#  VNeID (Định danh điện tử Quốc gia) Endpoints
# ══════════════════════════════════════════════════════════════

class VNeIDCallbackRequest(BaseModel):
    code: str
    state: str


class VNeIDAuthURLResponse(BaseModel):
    auth_url: str
    state: str


def _get_vneid_service() -> VNeIDService:
    return VNeIDService(
        client_id=settings.VNEID_CLIENT_ID,
        client_secret=settings.VNEID_CLIENT_SECRET,
        redirect_uri=settings.VNEID_REDIRECT_URI,
    )


# ══════════════════════════════════════════════════════════════
#  GET /verify/vneid/auth-url — Generate VNeID OAuth URL
# ══════════════════════════════════════════════════════════════

@router.get("/vneid/auth-url", response_model=VNeIDAuthURLResponse)
async def vneid_auth_url(current_user: CurrentUser = None):
    """
    Generate VNeID OAuth authorization URL.
    Creates a state token, stores in Redis, returns the auth URL.
    """
    # Check if user is already VNeID-verified
    kyc_data = current_user.kyc_data or {}
    if kyc_data.get("vneid", {}).get("verified_at"):
        raise HTTPException(400, "Tai khoan da duoc xac thuc VNeID")

    # Generate state token and store in Redis (5-minute TTL)
    state = secrets.token_urlsafe(32)
    redis = await get_redis()
    await redis.set(
        f"vneid_state:{state}",
        str(current_user.id),
        ex=300,  # 5 minutes
    )

    service = _get_vneid_service()
    auth_url = service.get_auth_url(state)

    logger.info("VNeID auth URL generated for user %s", current_user.id)

    return {"auth_url": auth_url, "state": state}


# ══════════════════════════════════════════════════════════════
#  POST /verify/vneid/callback — Handle VNeID OAuth callback
# ══════════════════════════════════════════════════════════════

@router.post("/vneid/callback")
async def vneid_callback(
    body: VNeIDCallbackRequest,
    current_user: CurrentUser = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Handle VNeID OAuth callback.
    - Validate state from Redis
    - Exchange code for token (mock)
    - Get verified identity (mock returns realistic data)
    - Auto-verify user: set identity_verified=True, fill full_name, CCCD, DOB
    - Check CCCD uniqueness
    - Return { success, verified_data }
    """
    # Validate state token from Redis
    redis = await get_redis()
    stored_user_id = await redis.get(f"vneid_state:{body.state}")

    if not stored_user_id:
        raise HTTPException(400, "State khong hop le hoac da het han")

    if stored_user_id != str(current_user.id):
        raise HTTPException(403, "State khong khop voi tai khoan hien tai")

    # Delete state token (one-time use)
    await redis.delete(f"vneid_state:{body.state}")

    service = _get_vneid_service()

    # Exchange authorization code for access token
    try:
        token_data = await service.exchange_code(body.code)
    except Exception as e:
        logger.error("VNeID token exchange failed: %s", e)
        raise HTTPException(502, "Khong the ket noi VNeID. Vui long thu lai.")

    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(502, "VNeID khong tra ve access token")

    # Get verified identity data
    try:
        vneid_data = await service.get_verified_identity(access_token)
    except Exception as e:
        logger.error("VNeID identity fetch failed: %s", e)
        raise HTTPException(
            502, "Khong the lay thong tin dinh danh tu VNeID"
        )

    if not vneid_data.get("verified"):
        raise HTTPException(400, "VNeID xac thuc khong thanh cong")

    # Verify user — update profile with VNeID data
    result = await service.verify_user(
        user_id=str(current_user.id),
        vneid_data=vneid_data,
        db=db,
    )

    if not result.get("success"):
        raise HTTPException(
            409,
            result.get("error", "Xac thuc VNeID that bai"),
        )

    logger.info(
        "VNeID verification completed for user %s", current_user.id
    )

    return result


# ══════════════════════════════════════════════════════════════
#  GET /verify/vneid/status — Check VNeID verification status
# ══════════════════════════════════════════════════════════════

@router.get("/vneid/status")
async def vneid_status(current_user: CurrentUser = None):
    """
    Check VNeID verification status.
    Returns if user has VNeID-verified identity, verification method,
    and verified_at timestamp.
    """
    kyc_data = current_user.kyc_data or {}
    vneid_info = kyc_data.get("vneid", {})

    is_verified = bool(vneid_info.get("verified_at"))

    # Mask CCCD number for security
    cccd_masked = None
    if current_user.identity_number and len(current_user.identity_number) >= 4:
        cccd_masked = f"***{current_user.identity_number[-4:]}"

    return {
        "vneid_verified": is_verified,
        "identity_verified": current_user.identity_verified,
        "full_name": current_user.full_name if is_verified else None,
        "cccd_masked": cccd_masked,
        "verification_method": vneid_info.get("verification_method"),
        "verified_at": vneid_info.get("verified_at"),
        "verification_level": current_user.verification_level,
    }
