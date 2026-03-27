"""
WellKOC — Fraud Detection Models
FraudScore: per-order fraud assessment with weighted factors
FraudAlert: actionable fraud alerts for admin investigation
"""
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import (
    Boolean, DateTime, ForeignKey, Integer, Numeric,
    String, Text, func, Index,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


# ── Enums ────────────────────────────────────────────────────

class FraudAction(str, Enum):
    NONE = "none"
    FLAGGED = "flagged"
    PAUSED = "paused"
    BLOCKED = "blocked"


class AlertType(str, Enum):
    SELF_REFERRAL = "self_referral"
    COMMISSION_ABUSE = "commission_abuse"
    VELOCITY = "velocity"
    DEVICE_MATCH = "device_match"


class AlertSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertStatus(str, Enum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"


class AlertResolution(str, Enum):
    CONFIRM_FRAUD = "confirm_fraud"
    FALSE_POSITIVE = "false_positive"


# ── FraudScore ───────────────────────────────────────────────

class FraudScore(Base):
    """Fraud risk score for a single order"""
    __tablename__ = "fraud_scores"
    __table_args__ = (
        Index("ix_fraud_scores_order_id", "order_id"),
        Index("ix_fraud_scores_score", "score"),
        Index("ix_fraud_scores_action", "action_taken"),
        {"schema": None},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False,
    )

    # ── Scoring ───────────────────────────────────────────────
    score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    factors: Mapped[dict] = mapped_column(
        JSONB, default=dict, nullable=False,
        comment="Breakdown of individual risk signals and their weights",
    )

    # ── Actions ───────────────────────────────────────────────
    action_taken: Mapped[str] = mapped_column(
        String(20), default=FraudAction.NONE, nullable=False,
    )
    resolved_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), nullable=True,
    )
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    is_fraud: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)

    # ── Timestamps ────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    def __repr__(self) -> str:
        return f"<FraudScore order={self.order_id} score={self.score} [{self.action_taken}]>"


# ── FraudAlert ───────────────────────────────────────────────

class FraudAlert(Base):
    """Actionable fraud alert for admin review"""
    __tablename__ = "fraud_alerts"
    __table_args__ = (
        Index("ix_fraud_alerts_order_id", "order_id"),
        Index("ix_fraud_alerts_koc_id", "koc_id"),
        Index("ix_fraud_alerts_status", "status"),
        Index("ix_fraud_alerts_severity", "severity"),
        Index("ix_fraud_alerts_type", "alert_type"),
        {"schema": None},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False,
    )
    koc_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False,
    )

    # ── Alert classification ──────────────────────────────────
    alert_type: Mapped[str] = mapped_column(String(30), nullable=False)
    severity: Mapped[str] = mapped_column(String(10), nullable=False)
    details: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)

    # ── Resolution ────────────────────────────────────────────
    status: Mapped[str] = mapped_column(
        String(20), default=AlertStatus.OPEN, nullable=False,
    )
    resolved_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), nullable=True,
    )
    resolution: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # ── Timestamps ────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    def __repr__(self) -> str:
        return f"<FraudAlert {self.alert_type} [{self.severity}] status={self.status}>"
