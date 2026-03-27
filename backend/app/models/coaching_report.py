"""
WellKOC — Coaching Report Model
Stores weekly AI-generated performance coaching reports for KOCs
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class CoachingReport(Base):
    """Weekly AI coaching report for a KOC"""
    __tablename__ = "coaching_reports"
    __table_args__ = (
        Index("ix_coaching_koc_id", "koc_id"),
        Index("ix_coaching_week", "year", "week_number"),
        {"schema": None},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    koc_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )

    # ── Period ────────────────────────────────────────────────
    week_number: Mapped[int] = mapped_column(Integer, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)

    # ── Report data ───────────────────────────────────────────
    metrics_snapshot: Mapped[dict] = mapped_column(JSONB, default=dict)
    # {total_orders, gmv, cvr, avg_order_value, content_count, engagement_rate}

    recommendations: Mapped[dict] = mapped_column(JSONB, default=dict)
    # {summary, top_recommendations: [...], growth_strategy}

    action_items: Mapped[list] = mapped_column(JSONB, default=list)
    # [{action, expected_roi, priority, deadline}]

    # ── Benchmarking ──────────────────────────────────────────
    peer_rank: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    improvement_score: Mapped[float] = mapped_column(
        Numeric(5, 2), default=0
    )  # % improvement vs 4-week avg

    # ── Metadata ──────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<CoachingReport KOC={self.koc_id} W{self.week_number}/{self.year}>"
