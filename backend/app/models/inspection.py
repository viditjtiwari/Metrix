from __future__ import annotations
from datetime import date, datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin
from app.models.enums import InspectionResult

if TYPE_CHECKING:
    from app.models.application import VerificationApplication
    from app.models.user import User


class Inspection(Base, TimestampMixin):
    """Field or lab verification inspection associated with an application."""
    __tablename__ = "inspections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    application_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("verification_applications.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )
    assigned_to_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    scheduled_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    scheduled_time: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    inspection_location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    scheduling_remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    result: Mapped[Optional[InspectionResult]] = mapped_column(
        Enum(InspectionResult, name="inspection_result"),
        nullable=True,
    )
    result_remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    application: Mapped[VerificationApplication] = relationship(
        "VerificationApplication", back_populates="inspection"
    )
    assigned_to: Mapped[Optional[User]] = relationship(
        "User", back_populates="assigned_inspections"
    )
    observations: Mapped[List[InspectionObservation]] = relationship(
        "InspectionObservation",
        back_populates="inspection",
        cascade="all, delete-orphan",
        order_by="InspectionObservation.created_at.asc()",
    )


class InspectionObservation(Base):
    """Relational measurement record for a specific testing parameter during inspection."""
    __tablename__ = "inspection_observations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    inspection_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("inspections.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    parameter_name: Mapped[str] = mapped_column(String(128), nullable=False)
    observed_value: Mapped[str] = mapped_column(String(64), nullable=False)
    standard_value: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    unit: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    is_passed: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    inspection: Mapped[Inspection] = relationship(
        "Inspection", back_populates="observations"
    )
