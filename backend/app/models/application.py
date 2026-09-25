from __future__ import annotations
from datetime import date, datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin
from app.models.enums import ApplicationStatus, PaymentStatus

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.instrument import Instrument
    from app.models.inspection import Inspection
    from app.models.certificate import Certificate


class VerificationApplication(Base, TimestampMixin):
    """Formal verification application for a weighing/measuring instrument."""
    __tablename__ = "verification_applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    application_number: Mapped[str] = mapped_column(
        String(64), unique=True, index=True, nullable=False
    )
    instrument_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("instruments.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )
    applicant_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )
    application_type: Mapped[str] = mapped_column(
        String(32), default="INITIAL", nullable=False
    )
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus, name="application_status"),
        default=ApplicationStatus.DRAFT,
        index=True,
        nullable=False,
    )
    submitted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # --- Payment / Fee Tracking (Rule 14) ---
    payment_status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, name="payment_status"),
        default=PaymentStatus.PENDING,
        index=True,
        nullable=False,
    )
    payment_receipt_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    challan_reference_number: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    challan_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    calculated_fee: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    late_fee: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_fee: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    payment_uploaded_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    payment_verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    payment_verified_by_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    payment_remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    instrument: Mapped[Instrument] = relationship(
        "Instrument", back_populates="applications"
    )
    applicant: Mapped[User] = relationship(
        "User", back_populates="applications", foreign_keys=[applicant_id]
    )
    payment_verified_by: Mapped[Optional[User]] = relationship(
        "User", foreign_keys=[payment_verified_by_id]
    )
    status_history: Mapped[List[ApplicationStatusHistory]] = relationship(
        "ApplicationStatusHistory",
        back_populates="application",
        cascade="all, delete-orphan",
        order_by="ApplicationStatusHistory.created_at.asc()",
    )
    inspection: Mapped[Optional[Inspection]] = relationship(
        "Inspection",
        back_populates="application",
        uselist=False,
        cascade="all, delete-orphan",
    )
    certificate: Mapped[Optional[Certificate]] = relationship(
        "Certificate",
        back_populates="application",
        uselist=False,
        cascade="all, delete-orphan",
    )


class ApplicationStatusHistory(Base):
    """Immutable audit trail of status transitions for verification applications."""
    __tablename__ = "application_status_histories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    application_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("verification_applications.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    from_status: Mapped[Optional[ApplicationStatus]] = mapped_column(
        Enum(ApplicationStatus, name="application_status"),
        nullable=True,
    )
    to_status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus, name="application_status"),
        nullable=False,
    )
    changed_by_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    application: Mapped[VerificationApplication] = relationship(
        "VerificationApplication", back_populates="status_history"
    )
    changed_by: Mapped[User] = relationship(
        "User", back_populates="status_changes"
    )
