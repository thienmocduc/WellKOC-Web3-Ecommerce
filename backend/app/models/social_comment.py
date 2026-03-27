"""
WellKOC — Social Comment Model
Tracks comments from TikTok/IG/FB with AI-generated auto-replies
"""
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text, func, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class CommentPlatform(str, Enum):
    TIKTOK = "tiktok"
    INSTAGRAM = "instagram"
    FACEBOOK = "facebook"


class CommentClassification(str, Enum):
    POSITIVE = "positive"
    QUESTION = "question"
    COMPLAINT = "complaint"
    SPAM = "spam"


class CommentStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    REPLIED = "replied"


class SocialComment(Base):
    """Incoming social media comments with AI-generated replies"""
    __tablename__ = "social_comments"
    __table_args__ = (
        Index("ix_social_comments_koc_id", "koc_id"),
        Index("ix_social_comments_platform", "platform"),
        Index("ix_social_comments_status", "status"),
        Index("ix_social_comments_classification", "classification"),
        Index("ix_social_comments_created_at", "created_at"),
        {"schema": None},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # ── Platform data ─────────────────────────────────────────
    platform: Mapped[str] = mapped_column(String(20), nullable=False)
    post_id: Mapped[str] = mapped_column(String(200), nullable=False)
    comment_id: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    author_name: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # ── AI analysis ───────────────────────────────────────────
    sentiment: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    classification: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    auto_reply: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ── Status & ownership ────────────────────────────────────
    status: Mapped[str] = mapped_column(String(20), default=CommentStatus.PENDING)
    custom_reply: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    koc_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )

    # ── Metadata ──────────────────────────────────────────────
    platform_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self) -> str:
        return f"<SocialComment {self.platform}:{self.comment_id} [{self.status}]>"
