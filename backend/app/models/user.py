"""
WellKOC — User Model
Supports Buyer / KOC / Vendor / Admin roles
"""
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import (
    Boolean, DateTime, ForeignKey, Integer, Numeric,
    String, Text, func, UniqueConstraint, Index,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserRole(str, Enum):
    BUYER = "buyer"
    KOC = "koc"
    VENDOR = "vendor"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class KYCStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    APPROVED = "approved"
    REJECTED = "rejected"


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("email", name="uq_users_email"),
        UniqueConstraint("phone", name="uq_users_phone"),
        UniqueConstraint("wallet_address", name="uq_users_wallet"),
        Index("ix_users_role", "role"),
        Index("ix_users_referral_code", "referral_code"),
        {"schema": None},
    )

    # ── Identity ─────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    wallet_address: Mapped[Optional[str]] = mapped_column(String(42), nullable=True)

    # ── Auth ─────────────────────────────────────────────────
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    phone_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    # ── Profile ──────────────────────────────────────────────
    role: Mapped[str] = mapped_column(String(20), default=UserRole.BUYER)
    full_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    display_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    language: Mapped[str] = mapped_column(String(5), default="vi")  # vi/en/zh/hi/th

    # ── KYC ──────────────────────────────────────────────────
    kyc_status: Mapped[str] = mapped_column(String(20), default=KYCStatus.PENDING)
    kyc_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    kyc_reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    kyc_reviewer_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)

    # ── Referral / Commission ────────────────────────────────
    referral_code: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False, default=""
    )
    referred_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    total_commission_earned: Mapped[float] = mapped_column(Numeric(18, 2), default=0)

    # ── On-chain ─────────────────────────────────────────────
    reputation_nft_token_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    reputation_score: Mapped[int] = mapped_column(Integer, default=0)
    wk_token_balance: Mapped[float] = mapped_column(Numeric(18, 8), default=0)

    # ── Membership ───────────────────────────────────────────
    membership_tier: Mapped[str] = mapped_column(String(20), default="free")
    membership_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # ── Metadata ─────────────────────────────────────────────
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    last_login_ip: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # ── Relationships ────────────────────────────────────────
    referred_by: Mapped[Optional["User"]] = relationship(
        "User", remote_side="User.id", foreign_keys=[referred_by_id]
    )

    def __repr__(self) -> str:
        return f"<User {self.display_name or self.email} [{self.role}]>"

    @property
    def is_koc(self) -> bool:
        return self.role == UserRole.KOC

    @property
    def is_vendor(self) -> bool:
        return self.role == UserRole.VENDOR

    @property
    def is_admin(self) -> bool:
        return self.role in (UserRole.ADMIN, UserRole.SUPER_ADMIN)
