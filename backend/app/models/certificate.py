from __future__ import annotations
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin
from app.models.enums import CertificateStatus

if TYPE_CHECKING:
    from app.models.application import VerificationApplication
    from app.models.instrument import Instrument
    from app.models.user import User


class Certificate(Base, TimestampMixin):
    """Digital legal metrology verification certificate issued for an instrument."""
    __tablename__ = "certificates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    certificate_number: Mapped[str] = mapped_column(
        String(64), unique=True, index=True, nullable=False
    )
    application_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("verification_applications.id", ondelete="RESTRICT"),
        unique=True,
        index=True,
        nullable=False,
    )
    instrument_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("instruments.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )
    issued_by_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )
    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    valid_from: Mapped[date] = mapped_column(Date, nullable=False)
    valid_until: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[CertificateStatus] = mapped_column(
        Enum(CertificateStatus, name="certificate_status"),
        default=CertificateStatus.ACTIVE,
        index=True,
        nullable=False,
    )
    integrity_hash: Mapped[str] = mapped_column(
        String(64), index=True, nullable=False
    )
    verification_token: Mapped[str] = mapped_column(
        String(64), unique=True, index=True, nullable=False
    )
    pdf_path: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    application: Mapped[VerificationApplication] = relationship(
        "VerificationApplication", back_populates="certificate"
    )
    instrument: Mapped[Instrument] = relationship(
        "Instrument", back_populates="certificates"
    )
    issued_by: Mapped[User] = relationship(
        "User", back_populates="issued_certificates"
    )
