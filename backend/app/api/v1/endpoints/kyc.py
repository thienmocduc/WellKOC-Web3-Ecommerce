"""WellKOC — KYC Upload & Review Endpoints"""
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.api.v1.deps import CurrentUser, require_role
from app.models.user import User, UserRole, KYCStatus

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/kyc", tags=["KYC"])


# ── Schemas ──────────────────────────────────────────────────

class KYCReviewReq(BaseModel):
    action: str  # approve | reject
    reason: Optional[str] = None


class KYCStatusResponse(BaseModel):
    kyc_status: str
    kyc_data: Optional[dict] = None
    reviewed_at: Optional[str] = None


# ── Helpers ──────────────────────────────────────────────────

async def _save_upload(file: UploadFile, user_id: str, doc_type: str) -> str:
    """
    Simulate S3 upload — save file locally and return a URL path.
    In production, replace with actual S3/CDN upload.
    """
    import os

    upload_dir = os.path.join("uploads", "kyc", str(user_id))
    os.makedirs(upload_dir, exist_ok=True)

    ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "jpg"
    filename = f"{doc_type}_{uuid.uuid4().hex[:8]}.{ext}"
    file_path = os.path.join(upload_dir, filename)

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            400,
            f"File quá lớn. Tối đa {settings.MAX_UPLOAD_SIZE_MB}MB",
        )

    with open(file_path, "wb") as f:
        f.write(content)

    # Return URL path (would be CDN URL in production)
    return f"/uploads/kyc/{user_id}/{filename}"


# ══════════════════════════════════════════════════════════════
#  POST /kyc/upload — Upload KYC documents (CCCD front/back)
# ══════════════════════════════════════════════════════════════

@router.post("/upload")
async def upload_kyc(
    front_image: UploadFile = File(..., description="Ảnh mặt trước CCCD"),
    back_image: UploadFile = File(..., description="Ảnh mặt sau CCCD"),
    *,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Upload CCCD front and back images for KYC verification."""
    # Validate file types
    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    for img, label in [(front_image, "Mặt trước"), (back_image, "Mặt sau")]:
        if img.content_type not in allowed_types:
            raise HTTPException(
                400,
                f"{label}: Chỉ chấp nhận file ảnh (JPEG, PNG, WebP)",
            )

    # Check if user already has approved KYC
    if current_user.kyc_status == KYCStatus.APPROVED:
        raise HTTPException(400, "KYC đã được xác minh, không cần upload lại")

    # Save files
    user_id = str(current_user.id)
    front_url = await _save_upload(front_image, user_id, "cccd_front")
    back_url = await _save_upload(back_image, user_id, "cccd_back")

    # Update user KYC data
    kyc_data = current_user.kyc_data or {}
    kyc_data.update({
        "cccd_front_url": front_url,
        "cccd_back_url": back_url,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    })

    current_user.kyc_data = kyc_data
    current_user.kyc_status = KYCStatus.PROCESSING
    db.add(current_user)
    await db.commit()

    logger.info("KYC documents uploaded for user %s", user_id)

    return {
        "message": "KYC documents đã được upload thành công",
        "kyc_status": KYCStatus.PROCESSING,
        "front_image_url": front_url,
        "back_image_url": back_url,
    }


# ══════════════════════════════════════════════════════════════
#  GET /kyc/status — Get current user's KYC status
# ══════════════════════════════════════════════════════════════

@router.get("/status")
async def get_kyc_status(current_user: CurrentUser):
    """Get the current user's KYC verification status."""
    kyc_data = current_user.kyc_data or {}

    return {
        "kyc_status": current_user.kyc_status,
        "has_documents": bool(kyc_data.get("cccd_front_url")),
        "uploaded_at": kyc_data.get("uploaded_at"),
        "reviewed_at": (
            current_user.kyc_reviewed_at.isoformat()
            if current_user.kyc_reviewed_at
            else None
        ),
        "reject_reason": kyc_data.get("reject_reason"),
    }


# ══════════════════════════════════════════════════════════════
#  PUT /kyc/review/{user_id} — Admin reviews KYC
# ══════════════════════════════════════════════════════════════

@router.put("/review/{user_id}")
async def review_kyc(
    user_id: uuid.UUID,
    body: KYCReviewReq,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Admin approves or rejects a user's KYC submission."""
    if body.action not in ("approve", "reject"):
        raise HTTPException(400, "Action phải là 'approve' hoặc 'reject'")

    # Find target user
    r = await db.execute(select(User).where(User.id == user_id))
    target_user = r.scalar_one_or_none()
    if not target_user:
        raise HTTPException(404, "Người dùng không tồn tại")

    if target_user.kyc_status not in (KYCStatus.PROCESSING, KYCStatus.REJECTED):
        raise HTTPException(
            400,
            f"Không thể review KYC ở trạng thái '{target_user.kyc_status}'",
        )

    now = datetime.now(timezone.utc)
    kyc_data = target_user.kyc_data or {}

    if body.action == "approve":
        target_user.kyc_status = KYCStatus.APPROVED
        kyc_data["approved_by"] = str(current_user.id)
        kyc_data.pop("reject_reason", None)
    else:
        if not body.reason:
            raise HTTPException(400, "Cần cung cấp lý do từ chối")
        target_user.kyc_status = KYCStatus.REJECTED
        kyc_data["reject_reason"] = body.reason
        kyc_data["rejected_by"] = str(current_user.id)

    target_user.kyc_data = kyc_data
    target_user.kyc_reviewed_at = now
    target_user.kyc_reviewer_id = current_user.id
    db.add(target_user)
    await db.commit()

    logger.info(
        "KYC %s for user %s by admin %s",
        body.action,
        user_id,
        current_user.id,
    )

    return {
        "message": f"KYC đã được {body.action}",
        "user_id": str(user_id),
        "kyc_status": target_user.kyc_status,
        "reviewed_at": now.isoformat(),
    }
