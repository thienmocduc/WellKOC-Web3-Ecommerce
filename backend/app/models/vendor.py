"""WellKOC — Vendor Profile Model"""
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Numeric, Text, DateTime, Boolean, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
class VendorProfile(Base):
    __tablename__ = "vendor_profiles"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    company_name: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    tax_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    business_license: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    categories: Mapped[Optional[list]] = mapped_column(JSONB, default=list)
    shipping_from: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    is_dpp_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    membership_tier: Mapped[str] = mapped_column(String(20), default="starter")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
