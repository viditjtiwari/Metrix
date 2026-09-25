from __future__ import annotations
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin
from app.models.enums import InstrumentType

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.application import VerificationApplication
    from app.models.certificate import Certificate


class Instrument(Base, TimestampMixin):
    """Weighing or measuring instrument registered in legal metrology."""
    __tablename__ = "instruments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    registration_number: Mapped[str] = mapped_column(
        String(64), unique=True, index=True, nullable=False
    )
    owner_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )
    instrument_type: Mapped[InstrumentType] = mapped_column(
        Enum(InstrumentType, name="instrument_type"), index=True, nullable=False
    )
    manufacturer: Mapped[str] = mapped_column(String(128), nullable=False)
    model_name: Mapped[str] = mapped_column(String(128), nullable=False)
    serial_number: Mapped[str] = mapped_column(
        String(128), index=True, nullable=False
    )
    manufacturing_year: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )
    capacity: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    min_capacity: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    max_capacity: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    capacity_unit: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    min_capacity_unit: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    max_capacity_unit: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    division: Mapped[Optional[str]] = mapped_column(
        String(32), nullable=True, doc="Smallest scale division (e.g. 10g)"
    )
    image_urls: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    purchase_invoice_url: Mapped[Optional[str]] = mapped_column(
        String(512), nullable=True, doc="URL of uploaded purchase invoice PDF/image"
    )
    tac_certificate_url: Mapped[Optional[str]] = mapped_column(
        String(512), nullable=True,
        doc="Type Approval Certificate URL (required for initial verification)"
    )
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    owner: Mapped[User] = relationship("User", back_populates="instruments")
    applications: Mapped[List[VerificationApplication]] = relationship(
        "VerificationApplication", back_populates="instrument"
    )
    certificates: Mapped[List[Certificate]] = relationship(
        "Certificate", back_populates="instrument"
    )

    @property
    def is_gatc_required(self) -> bool:
        """Whether this instrument type mandates GATC laboratory testing."""
        from app.models.enums import is_gatc_instrument
        return is_gatc_instrument(self.instrument_type)


