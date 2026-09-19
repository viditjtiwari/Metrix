from __future__ import annotations
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin
from app.models.enums import ApplicationStatus

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.instrument import Instrument
    from app.models.inspection import Inspection


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

    instrument: Mapped[Instrument] = relationship(
        "Instrument", back_populates="applications"
    )
    applicant: Mapped[User] = relationship(
        "User", back_populates="applications"
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
