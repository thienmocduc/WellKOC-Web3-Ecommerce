"""
WellKOC — Social Shopping Event Models (Module #40: Mega Sale)
Events, participants, leaderboard for social shopping campaigns.
"""
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import (
    DateTime, ForeignKey, Integer, Numeric,
    String, Text, func, Index, UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class EventStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    ENDED = "ended"
    CANCELLED = "cancelled"


class ShoppingEvent(Base):
    """Mega-sale / social shopping campaign"""
    __tablename__ = "shopping_events"
    __table_args__ = (
        Index("ix_shopping_events_status", "status"),
        Index("ix_shopping_events_start_at", "start_at"),
        Index("ix_shopping_events_end_at", "end_at"),
        {"schema": None},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    banner_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ── Schedule ──────────────────────────────────────────────
    start_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    # ── Linked products & KOCs ────────────────────────────────
    product_ids: Mapped[list] = mapped_column(JSONB, default=list)
    koc_ids: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    commission_split: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    # e.g. {"t1": 0.40, "t2": 0.13, "platform": 0.30, "pool": 0.17}

    # ── Status & Targets ──────────────────────────────────────
    status: Mapped[str] = mapped_column(String(20), default=EventStatus.DRAFT)
    target_gmv: Mapped[float] = mapped_column(Numeric(18, 2), default=0)
    actual_gmv: Mapped[float] = mapped_column(Numeric(18, 2), default=0)
    total_orders: Mapped[int] = mapped_column(Integer, default=0)
    total_participants: Mapped[int] = mapped_column(Integer, default=0)
    commission_pool: Mapped[float] = mapped_column(Numeric(18, 2), default=0)

    # ── NFT Rewards ───────────────────────────────────────────
    nft_rewards_config: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    # e.g. {"top_1": {"name": "Gold Badge", "image": "..."}, "top_10": {...}}

    # ── Metadata ──────────────────────────────────────────────
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"),
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(),
    )

    def __repr__(self) -> str:
        return f"<ShoppingEvent {self.title} [{self.status}]>"


class EventParticipant(Base):
    """KOC who joined a shopping event"""
    __tablename__ = "event_participants"
    __table_args__ = (
        UniqueConstraint("event_id", "koc_id", name="uq_event_koc"),
        Index("ix_event_participants_event_id", "event_id"),
        Index("ix_event_participants_koc_id", "koc_id"),
        {"schema": None},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("shopping_events.id"), nullable=False,
    )
    koc_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False,
    )
    joined_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # ── Performance ───────────────────────────────────────────
    orders_count: Mapped[int] = mapped_column(Integer, default=0)
    gmv_contributed: Mapped[float] = mapped_column(Numeric(18, 2), default=0)
    commission_earned: Mapped[float] = mapped_column(Numeric(18, 2), default=0)
    rank: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # ── NFT Award ─────────────────────────────────────────────
    nft_award_token_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    def __repr__(self) -> str:
        return f"<EventParticipant event={self.event_id} koc={self.koc_id}>"


class EventLeaderboardEntry(Base):
    """Cached leaderboard for real-time ranking during event"""
    __tablename__ = "event_leaderboard"
    __table_args__ = (
        UniqueConstraint("event_id", "koc_id", name="uq_leaderboard_event_koc"),
        Index("ix_event_leaderboard_event_id", "event_id"),
        Index("ix_event_leaderboard_rank", "event_id", "rank"),
        {"schema": None},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("shopping_events.id"), nullable=False,
    )
    koc_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False,
    )
    score: Mapped[float] = mapped_column(Numeric(18, 2), default=0)
    orders: Mapped[int] = mapped_column(Integer, default=0)
    gmv: Mapped[float] = mapped_column(Numeric(18, 2), default=0)
    rank: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(),
    )

    def __repr__(self) -> str:
        return f"<LeaderboardEntry event={self.event_id} koc={self.koc_id} rank={self.rank}>"
