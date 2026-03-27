"""
WellKOC — Multi-Platform Publishing Models
PublishJob: tracks content publishing to TikTok, Instagram, Facebook, YouTube, Telegram
PlatformConnection: stores OAuth credentials for connected platforms
"""
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import (
    Boolean, DateTime, ForeignKey, Integer,
    String, Text, func, Index,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


# ── Enums ────────────────────────────────────────────────────

class Platform(str, Enum):
    TIKTOK = "tiktok"
    INSTAGRAM = "instagram"
    FACEBOOK = "facebook"
    YOUTUBE = "youtube"
    TELEGRAM = "telegram"


class PublishStatus(str, Enum):
    QUEUED = "queued"
    PUBLISHING = "publishing"
    PUBLISHED = "published"
    FAILED = "failed"
    CANCELLED = "cancelled"


# ── PublishJob ───────────────────────────────────────────────

class PublishJob(Base):
    """One publishing task per platform per publish request"""
    __tablename__ = "publish_jobs"
    __table_args__ = (
        Index("ix_publish_jobs_user_id", "user_id"),
        Index("ix_publish_jobs_status", "status"),
        Index("ix_publish_jobs_platform", "platform"),
        Index("ix_publish_jobs_schedule_at", "schedule_at"),
        {"schema": None},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False,
    )

    # ── Content ───────────────────────────────────────────────
    platform: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    media_urls: Mapped[list] = mapped_column(JSONB, default=list)
    hashtags: Mapped[list] = mapped_column(JSONB, default=list)

    # ── Affiliate ─────────────────────────────────────────────
    product_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), nullable=True,
    )
    affiliate_link: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # ── Scheduling ────────────────────────────────────────────
    schedule_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # ── Status ────────────────────────────────────────────────
    status: Mapped[str] = mapped_column(
        String(20), default=PublishStatus.QUEUED, nullable=False,
    )
    platform_post_id: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ── Metrics ───────────────────────────────────────────────
    metrics: Mapped[Optional[dict]] = mapped_column(
        JSONB, nullable=True, default=dict,
        comment="views, likes, comments, shares",
    )

    # ── Timestamps ────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(),
    )

    def __repr__(self) -> str:
        return f"<PublishJob {self.platform} [{self.status}]>"


# ── PlatformConnection ───────────────────────────────────────

class PlatformConnection(Base):
    """OAuth connection to a social platform for a user"""
    __tablename__ = "platform_connections"
    __table_args__ = (
        Index("ix_platform_conn_user_id", "user_id"),
        Index("ix_platform_conn_platform", "platform"),
        Index(
            "uq_platform_conn_user_platform",
            "user_id", "platform",
            unique=True,
        ),
        {"schema": None},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False,
    )

    # ── Platform info ─────────────────────────────────────────
    platform: Mapped[str] = mapped_column(String(20), nullable=False)
    platform_user_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    platform_username: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # ── Tokens (encrypted at rest) ────────────────────────────
    access_token_encrypted: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    refresh_token_encrypted: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ── Lifecycle ─────────────────────────────────────────────
    connected_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    def __repr__(self) -> str:
        return f"<PlatformConnection {self.platform} user={self.user_id} active={self.is_active}>"
