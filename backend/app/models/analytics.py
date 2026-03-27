"""
WellKOC — Analytics Models (Module #29: Vendor BI Dashboard)
Event tracking and pre-aggregated snapshots for vendor analytics.
"""
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import (
    DateTime, ForeignKey, Integer, Numeric,
    String, func, Index,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AnalyticsEventType(str, Enum):
    VIEW = "view"
    CART = "cart"
    PURCHASE = "purchase"
    REFUND = "refund"


class SnapshotPeriod(str, Enum):
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class AnalyticsEvent(Base):
    """Raw analytics event — page view, add-to-cart, purchase, refund"""
    __tablename__ = "analytics_events"
    __table_args__ = (
        Index("ix_analytics_events_type", "event_type"),
        Index("ix_analytics_events_vendor_id", "vendor_id"),
        Index("ix_analytics_events_product_id", "product_id"),
        Index("ix_analytics_events_created_at", "created_at"),
        Index("ix_analytics_events_koc_id", "koc_id"),
        {"schema": None},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    event_type: Mapped[str] = mapped_column(String(20), nullable=False)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), nullable=True,
    )
    product_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), nullable=True,
    )
    vendor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), nullable=True,
    )
    koc_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), nullable=True,
    )
    amount: Mapped[float] = mapped_column(Numeric(18, 2), default=0)
    metadata_: Mapped[Optional[dict]] = mapped_column(
        "metadata", JSONB, nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    def __repr__(self) -> str:
        return f"<AnalyticsEvent {self.event_type} product={self.product_id}>"


class AnalyticsSnapshot(Base):
    """Pre-aggregated analytics snapshot per vendor per period"""
    __tablename__ = "analytics_snapshots"
    __table_args__ = (
        Index("ix_analytics_snap_vendor_period", "vendor_id", "period", "period_start"),
        {"schema": None},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    vendor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False,
    )
    period: Mapped[str] = mapped_column(String(10), nullable=False)
    # "hourly", "daily", "weekly", "monthly"
    period_start: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    metrics: Mapped[dict] = mapped_column(JSONB, default=dict)
    # {gmv, orders, aov, unique_buyers, conversion_rate, top_products, top_kocs}
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    def __repr__(self) -> str:
        return f"<AnalyticsSnapshot vendor={self.vendor_id} {self.period} {self.period_start}>"
