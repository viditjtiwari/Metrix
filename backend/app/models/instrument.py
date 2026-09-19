from __future__ import annotations
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String
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
    capacity: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    owner: Mapped[User] = relationship("User", back_populates="instruments")
    applications: Mapped[List[VerificationApplication]] = relationship(
        "VerificationApplication", back_populates="instrument"
    )
    certificates: Mapped[List[Certificate]] = relationship(
        "Certificate", back_populates="instrument"
    )

