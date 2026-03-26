"""WellKOC — KOC Profile Model"""
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Numeric, Text, DateTime, Boolean, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
class KOCProfile(Base):
    __tablename__ = "koc_profiles"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    niche: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    platforms: Mapped[Optional[list]] = mapped_column(JSONB, default=list)
    social_links: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)
    follower_count: Mapped[int] = mapped_column(Integer, default=0)
    avg_cvr: Mapped[float] = mapped_column(Numeric(5,2), default=0)
    preferred_categories: Mapped[Optional[list]] = mapped_column(JSONB, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
