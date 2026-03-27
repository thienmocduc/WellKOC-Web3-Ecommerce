"""
WellKOC — Compliance, VAT & ATTP Models (Module #50)
Tax reports, audit trails, ATTP certifications for supplements.
"""
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import (
    DateTime, ForeignKey, Integer,
    String, Text, func, Index,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ReportType(str, Enum):
    VAT = "vat"
    AUDIT = "audit"
    COMMISSION = "commission"
    ORDERS = "orders"
    PRODUCTS = "products"


class CertStatus(str, Enum):
    VALID = "valid"
    EXPIRED = "expired"
    REVOKED = "revoked"


class ComplianceReport(Base):
    """Generated compliance / tax report"""
    __tablename__ = "compliance_reports"
    __table_args__ = (
        Index("ix_compliance_reports_type", "report_type"),
        Index("ix_compliance_reports_created_at", "created_at"),
        {"schema": None},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    report_type: Mapped[str] = mapped_column(String(20), nullable=False)
    period_start: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    period_end: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    generated_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"),
    )
    file_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sha256_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    blockchain_tx_hash: Mapped[Optional[str]] = mapped_column(String(66), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    def __repr__(self) -> str:
        return f"<ComplianceReport {self.report_type} {self.period_start}—{self.period_end}>"


class ATTPCertification(Base):
    """ATTP (supplement safety) certification for a product"""
    __tablename__ = "attp_certifications"
    __table_args__ = (
        Index("ix_attp_cert_product_id", "product_id"),
        Index("ix_attp_cert_vendor_id", "vendor_id"),
        Index("ix_attp_cert_status", "status"),
        {"schema": None},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id"), nullable=False,
    )
    vendor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False,
    )
    cert_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # e.g. "attp", "gmp", "haccp", "iso22000", "fda"
    cert_number: Mapped[str] = mapped_column(String(100), nullable=False)
    issuer: Mapped[str] = mapped_column(String(255), nullable=False)
    issued_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    document_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default=CertStatus.VALID)
    verified_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(),
    )

    def __repr__(self) -> str:
        return f"<ATTPCert {self.cert_type} product={self.product_id} [{self.status}]>"
