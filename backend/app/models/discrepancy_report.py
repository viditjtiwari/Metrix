"""DiscrepancyReport model for persisting whistleblower / anti-tamper complaints."""
from __future__ import annotations
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.certificate import Certificate
    from app.models.user import User


class DiscrepancyReport(Base, TimestampMixin):
    """Citizen-filed complaint about a suspicious or tampered certificate.

    Submitted via the public QR verification page, reviewed by LMO/Admin.
    """
    __tablename__ = "discrepancy_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    report_reference_id: Mapped[str] = mapped_column(
        String(32), unique=True, nullable=False, index=True,
    )
    certificate_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("certificates.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )

    # Report details (from public submission)
    discrepancy_type: Mapped[str] = mapped_column(String(64), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    reporter_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    reporter_phone: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    evidence_image_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    # Review / action tracking
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, default="PENDING",
        doc="PENDING, UNDER_REVIEW, RESOLVED, DISMISSED",
    )
    reviewed_by_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    action_remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True,
    )

    # Relationships
    certificate: Mapped[Certificate] = relationship("Certificate")
    reviewed_by: Mapped[Optional[User]] = relationship("User")
