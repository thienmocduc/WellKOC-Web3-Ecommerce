"""
WellKOC — Duplicate Detection Service
Ensures 1 person = 1 account by checking phone, bank, identity, and device fingerprint.
"""
import logging
from typing import Optional
from uuid import UUID

from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User

logger = logging.getLogger(__name__)


class DuplicateDetector:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def check_phone_duplicate(
        self, phone: str, user_id: UUID
    ) -> Optional[User]:
        """Kiểm tra số điện thoại đã được sử dụng bởi tài khoản khác chưa."""
        result = await self.db.execute(
            select(User).where(
                and_(
                    User.phone == phone,
                    User.id != user_id,
                    User.phone_verified == True,  # noqa: E712
                )
            )
        )
        return result.scalar_one_or_none()

    async def check_bank_duplicate(
        self, bank_account_number: str, user_id: UUID
    ) -> Optional[User]:
        """Kiểm tra số tài khoản ngân hàng đã được sử dụng bởi tài khoản khác chưa."""
        result = await self.db.execute(
            select(User).where(
                and_(
                    User.bank_account_number == bank_account_number,
                    User.id != user_id,
                )
            )
        )
        return result.scalar_one_or_none()

    async def check_identity_duplicate(
        self, identity_number: str, user_id: UUID
    ) -> Optional[User]:
        """Kiểm tra số CCCD/CMND đã được sử dụng bởi tài khoản khác chưa."""
        result = await self.db.execute(
            select(User).where(
                and_(
                    User.identity_number == identity_number,
                    User.id != user_id,
                )
            )
        )
        return result.scalar_one_or_none()

    async def check_device_fingerprint(
        self, fingerprint: str, user_id: UUID
    ) -> list[User]:
        """Kiểm tra thiết bị đã có nhiều tài khoản chưa.

        Looks for fingerprint matches in kyc_data JSONB field.
        Returns list of users sharing the same device fingerprint.
        """
        # Query users whose kyc_data contains this fingerprint
        result = await self.db.execute(
            select(User).where(
                and_(
                    User.kyc_data["device_fingerprint"].astext == fingerprint,
                    User.id != user_id,
                    User.is_active == True,  # noqa: E712
                )
            )
        )
        return list(result.scalars().all())

    async def get_linked_accounts(self, user_id: UUID) -> dict:
        """Tìm tất cả tài khoản chia sẻ phone/bank/identity/device với user này.

        Returns a dict with linked accounts grouped by match type.
        """
        # First get the target user
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return {"phone": [], "bank": [], "identity": [], "device": []}

        linked = {
            "phone": [],
            "bank": [],
            "identity": [],
            "device": [],
        }

        # Check phone links
        if user.phone and user.phone_verified:
            result = await self.db.execute(
                select(User).where(
                    and_(
                        User.phone == user.phone,
                        User.id != user_id,
                    )
                )
            )
            linked["phone"] = [
                {"user_id": str(u.id), "display_name": u.display_name, "email": u.email}
                for u in result.scalars().all()
            ]

        # Check bank account links
        if user.bank_account_number:
            result = await self.db.execute(
                select(User).where(
                    and_(
                        User.bank_account_number == user.bank_account_number,
                        User.id != user_id,
                    )
                )
            )
            linked["bank"] = [
                {"user_id": str(u.id), "display_name": u.display_name, "email": u.email}
                for u in result.scalars().all()
            ]

        # Check identity number links
        if user.identity_number:
            result = await self.db.execute(
                select(User).where(
                    and_(
                        User.identity_number == user.identity_number,
                        User.id != user_id,
                    )
                )
            )
            linked["identity"] = [
                {"user_id": str(u.id), "display_name": u.display_name, "email": u.email}
                for u in result.scalars().all()
            ]

        # Check device fingerprint links
        device_fp = (user.kyc_data or {}).get("device_fingerprint")
        if device_fp:
            device_users = await self.check_device_fingerprint(device_fp, user_id)
            linked["device"] = [
                {"user_id": str(u.id), "display_name": u.display_name, "email": u.email}
                for u in device_users
            ]

        return linked

    async def flag_suspicious_accounts(self, user_id: UUID) -> dict:
        """Tự động đánh dấu tài khoản đáng ngờ nếu có nhiều liên kết.

        If a user has linked accounts via phone, bank, or identity,
        flag both the user and the linked accounts for review.
        Returns summary of flagged accounts.
        """
        linked = await self.get_linked_accounts(user_id)

        total_links = sum(len(v) for v in linked.values())
        if total_links == 0:
            return {
                "is_suspicious": False,
                "linked_count": 0,
                "message": "Không phát hiện tài khoản trùng lặp",
            }

        # Flag the user
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return {"is_suspicious": False, "linked_count": 0}

        # Update kyc_data with suspicious flag
        kyc_data = user.kyc_data or {}
        kyc_data["suspicious"] = True
        kyc_data["suspicious_reason"] = f"Phát hiện {total_links} tài khoản liên kết"
        kyc_data["linked_accounts"] = {
            k: [item["user_id"] for item in v]
            for k, v in linked.items()
            if v
        }
        user.kyc_data = kyc_data
        self.db.add(user)

        # Flag linked accounts too
        flagged_user_ids = []
        for match_type, accounts in linked.items():
            for account in accounts:
                linked_uid = UUID(account["user_id"])
                flagged_user_ids.append(str(linked_uid))
                r = await self.db.execute(select(User).where(User.id == linked_uid))
                linked_user = r.scalar_one_or_none()
                if linked_user:
                    linked_kyc = linked_user.kyc_data or {}
                    linked_kyc["suspicious"] = True
                    linked_kyc.setdefault("linked_to", [])
                    if str(user_id) not in linked_kyc["linked_to"]:
                        linked_kyc["linked_to"].append(str(user_id))
                    linked_user.kyc_data = linked_kyc
                    self.db.add(linked_user)

        await self.db.flush()

        logger.warning(
            "Flagged suspicious user %s with %d linked accounts: %s",
            user_id, total_links, flagged_user_ids,
        )

        return {
            "is_suspicious": True,
            "linked_count": total_links,
            "linked_by_phone": len(linked["phone"]),
            "linked_by_bank": len(linked["bank"]),
            "linked_by_identity": len(linked["identity"]),
            "linked_by_device": len(linked["device"]),
            "flagged_user_ids": flagged_user_ids,
            "message": f"Đã đánh dấu {total_links} tài khoản đáng ngờ",
        }
