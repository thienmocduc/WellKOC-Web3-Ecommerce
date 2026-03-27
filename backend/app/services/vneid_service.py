"""
VNeID Integration Service
Ket noi Dinh danh dien tu Quoc gia (VNeID) cho xac thuc danh tinh

VNeID OAuth2 + eKYC flow:
1. User clicks "Xac thuc qua VNeID"
2. Redirect to VNeID OAuth consent page
3. User approves sharing identity data
4. VNeID returns authorization code
5. Backend exchanges code for access_token
6. Backend calls VNeID API to get verified identity
7. Auto-fill user profile + set identity_verified = True

Currently uses MOCK responses. When real VNeID credentials arrive,
swap the _mock_* methods with actual API calls.
"""
import logging
import secrets
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import urlencode
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.user import User

logger = logging.getLogger(__name__)


class VNeIDService:
    """
    VNeID (Dinh danh dien tu Quoc gia) integration service.
    Handles OAuth2 authorization flow and identity verification.
    """

    VNEID_AUTH_URL = "https://vneid.gov.vn/oauth2/authorize"
    VNEID_TOKEN_URL = "https://vneid.gov.vn/oauth2/token"
    VNEID_USERINFO_URL = "https://vneid.gov.vn/api/v1/userinfo"

    SCOPES = "openid profile identity address"

    def __init__(
        self,
        client_id: Optional[str] = None,
        client_secret: Optional[str] = None,
        redirect_uri: Optional[str] = None,
    ):
        self.client_id = client_id or settings.VNEID_CLIENT_ID
        self.client_secret = client_secret or settings.VNEID_CLIENT_SECRET
        self.redirect_uri = redirect_uri or settings.VNEID_REDIRECT_URI
        self._use_mock = not self.client_id  # Use mock when no credentials

    # ── OAuth URL Generation ──────────────────────────────────

    def get_auth_url(self, state: str) -> str:
        """Generate VNeID OAuth authorization URL."""
        params = {
            "response_type": "code",
            "client_id": self.client_id or "wellkoc_mock_client",
            "redirect_uri": self.redirect_uri,
            "scope": self.SCOPES,
            "state": state,
        }
        return f"{self.VNEID_AUTH_URL}?{urlencode(params)}"

    # ── Token Exchange ────────────────────────────────────────

    async def exchange_code(self, code: str) -> dict:
        """
        Exchange authorization code for access token.
        POST to VNEID_TOKEN_URL.
        Returns: { access_token, token_type, expires_in, scope }
        """
        if self._use_mock:
            return self._mock_exchange_code(code)

        # Production: actual HTTP call to VNeID
        import httpx
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                self.VNEID_TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": self.redirect_uri,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            response.raise_for_status()
            return response.json()

    async def get_verified_identity(self, access_token: str) -> dict:
        """
        Get verified identity from VNeID.
        GET VNEID_USERINFO_URL with Bearer token.
        Returns verified citizen data from CCCD chip / face match.
        """
        if self._use_mock:
            return self._mock_verified_identity()

        # Production: actual HTTP call to VNeID
        import httpx
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                self.VNEID_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            response.raise_for_status()
            return response.json()

    # ── User Verification ─────────────────────────────────────

    async def verify_user(
        self, user_id: str, vneid_data: dict, db: AsyncSession
    ) -> dict:
        """
        Update user profile with VNeID verified data.
        - Check CCCD not already used by another account
        - Update user: full_name, identity_number, date_of_birth, etc.
        - Set identity_verified = True, verification_level >= 3
        - Return verification result
        """
        from datetime import date

        cccd_number = vneid_data.get("cccd_number", "")

        # Check CCCD uniqueness — prevent one CCCD for multiple accounts
        existing = await db.execute(
            select(User).where(
                User.identity_number == cccd_number,
                User.id != UUID(user_id),
            )
        )
        if existing.scalar_one_or_none():
            logger.warning(
                "CCCD %s already linked to another account", cccd_number[-4:]
            )
            return {
                "success": False,
                "error": "CCCD da duoc lien ket voi tai khoan khac",
                "error_code": "CCCD_ALREADY_USED",
            }

        # Find current user
        result = await db.execute(select(User).where(User.id == UUID(user_id)))
        user = result.scalar_one_or_none()
        if not user:
            return {"success": False, "error": "Nguoi dung khong ton tai"}

        # Parse date of birth
        dob_str = vneid_data.get("date_of_birth", "")
        dob = None
        if dob_str:
            try:
                dob = date.fromisoformat(dob_str)
            except ValueError:
                # Try dd/mm/yyyy format
                try:
                    parts = dob_str.split("/")
                    dob = date(int(parts[2]), int(parts[1]), int(parts[0]))
                except (ValueError, IndexError):
                    pass

        now = datetime.now(timezone.utc)

        # Update user profile with verified data
        user.full_name = vneid_data.get("full_name", user.full_name)
        user.identity_number = cccd_number
        user.date_of_birth = dob
        user.identity_verified = True
        user.identity_verified_at = now

        # Bump verification level to at least 3 (identity verified)
        if user.verification_level < 3:
            user.verification_level = 3

        # Store VNeID metadata in kyc_data
        kyc_data = user.kyc_data or {}
        kyc_data["vneid"] = {
            "verified_at": now.isoformat(),
            "verification_method": vneid_data.get(
                "verification_method", "chip_nfc"
            ),
            "gender": vneid_data.get("gender"),
            "address": vneid_data.get("address"),
            "province": vneid_data.get("province"),
            "district": vneid_data.get("district"),
            "ward": vneid_data.get("ward"),
        }
        user.kyc_data = kyc_data

        db.add(user)
        await db.commit()

        logger.info(
            "VNeID verification completed for user %s (CCCD ***%s)",
            user_id,
            cccd_number[-4:],
        )

        return {
            "success": True,
            "verified_data": {
                "full_name": user.full_name,
                "cccd_masked": f"***{cccd_number[-4:]}" if len(cccd_number) >= 4 else "***",
                "date_of_birth": str(dob) if dob else None,
                "gender": vneid_data.get("gender"),
                "address": vneid_data.get("address"),
                "verification_method": vneid_data.get(
                    "verification_method", "chip_nfc"
                ),
                "verified_at": now.isoformat(),
            },
        }

    # ── Mock Responses ────────────────────────────────────────
    # Used during development. Replace with real API calls when
    # VNeID government registration is completed.

    def _mock_exchange_code(self, code: str) -> dict:
        """Mock token exchange — returns a fake access token."""
        return {
            "access_token": f"vneid_mock_{secrets.token_hex(16)}",
            "token_type": "Bearer",
            "expires_in": 3600,
            "scope": self.SCOPES,
        }

    def _mock_verified_identity(self) -> dict:
        """
        Mock verified identity — returns realistic Vietnamese citizen data.
        In production, this data comes from the CCCD chip via NFC or
        face-matching verification in the VNeID app.
        """
        return {
            "cccd_number": "001099012345",
            "full_name": "NGUYEN VAN AN",
            "date_of_birth": "1995-06-15",
            "gender": "Nam",
            "address": "123 Nguyen Hue, Phuong Ben Nghe",
            "province": "TP. Ho Chi Minh",
            "district": "Quan 1",
            "ward": "Phuong Ben Nghe",
            "photo_base64": None,  # Base64 photo from chip (omitted in mock)
            "verified": True,
            "verification_method": "chip_nfc",
        }
