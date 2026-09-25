from __future__ import annotations
from datetime import date, datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin
from app.models.enums import InspectionMode, InspectionResult

if TYPE_CHECKING:
    from app.models.application import VerificationApplication
    from app.models.user import User


class Inspection(Base, TimestampMixin):
    """Field or lab verification inspection associated with an application.

    Stores both the structured government-standard checklist (physical +
    metrological tests) and the GATC lab report review workflow.
    """
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

    # --- Scheduling ---
    scheduled_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    scheduled_time: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    inspection_location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    scheduling_remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # --- Inspection Mode (LMO field vs GATC lab) ---
    inspection_mode: Mapped[Optional[InspectionMode]] = mapped_column(
        Enum(InspectionMode, name="inspection_mode"), nullable=True
    )

    # --- Timing ---
    started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # --- Structured Checklist Data (JSON) ---
    # Physical inspection checklist: manufacturer seal, display, leveling, etc.
    physical_inspection_data: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True,
        doc="JSON: {seal_intact, display_readable, leveling_ok, power_stable, overall_condition, remarks}"
    )
    # Metrological test results: zero error, span, eccentricity, discrimination, repeatability
    metrological_test_data: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True,
        doc="JSON: {zero_error, span_tests[], eccentricity, discrimination, repeatability, mpe_limits}"
    )

    # --- Result & Seal ---
    result: Mapped[Optional[InspectionResult]] = mapped_column(
        Enum(InspectionResult, name="inspection_result"),
        nullable=True,
    )
    result_remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    seal_number: Mapped[Optional[str]] = mapped_column(
        String(64), nullable=True, doc="Physical seal number affixed on instrument"
    )
    stamp_quarter: Mapped[Optional[str]] = mapped_column(
        String(16), nullable=True, doc="Stamp quarter e.g. Q3-2026"
    )

    # --- Media ---
    image_urls: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    certificate_image_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    # --- GATC Lab Report & LMO Review ---
    gatc_test_report_url: Mapped[Optional[str]] = mapped_column(
        String(512), nullable=True, doc="GATC uploaded test report PDF URL"
    )
    gatc_recommendation: Mapped[Optional[str]] = mapped_column(
        String(16), nullable=True, doc="GATC recommendation: CERTIFY or REJECT"
    )
    lmo_approval_status: Mapped[Optional[str]] = mapped_column(
        String(32), nullable=True,
        doc="LMO review of GATC report: APPROVED, CLARIFICATION_ASKED, REJECTED"
    )
    lmo_approval_remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # --- Relationships ---
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

