"""
WellKOC — Recommendation Models
UserBehaviorEvent: tracks view/cart/purchase/wishlist actions
RecommendationCache: stores pre-computed recommendation results
"""
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class BehaviorEventType(str, Enum):
    VIEW = "view"
    CART = "add_to_cart"
    PURCHASE = "purchase"
    WISHLIST = "wishlist"


class UserBehaviorEvent(Base):
    """Tracks user interactions with products for recommendation engine"""
    __tablename__ = "user_behavior_events"
    __table_args__ = (
        Index("ix_behavior_user_id", "user_id"),
        Index("ix_behavior_product_id", "product_id"),
        Index("ix_behavior_event_type", "event_type"),
        Index("ix_behavior_created_at", "created_at"),
        {"schema": None},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id"), nullable=False
    )
    event_type: Mapped[str] = mapped_column(
        String(20), nullable=False
    )
    context: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True
    )  # homepage / product / cart / search
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )


class RecommendationCache(Base):
    """Caches pre-computed recommendation lists per user"""
    __tablename__ = "recommendation_cache"
    __table_args__ = (
        Index("ix_reccache_user_id", "user_id"),
        {"schema": None},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    product_ids: Mapped[list] = mapped_column(JSONB, default=list)
    algorithm: Mapped[str] = mapped_column(
        String(50), default="hybrid"
    )  # hybrid / collaborative / trending / koc_followed
    score: Mapped[float] = mapped_column(
        Numeric(5, 4), default=0
    )
    cached_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
