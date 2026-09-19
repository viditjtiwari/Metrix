from __future__ import annotations
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin
from app.models.enums import UserRole

if TYPE_CHECKING:
    from app.models.instrument import Instrument
    from app.models.application import VerificationApplication, ApplicationStatusHistory
    from app.models.inspection import Inspection
    from app.models.certificate import Certificate
    from app.models.notification import Notification


class User(Base, TimestampMixin):
    """User account model for system authentication and RBAC."""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"), index=True, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # 1-to-1 relationship with stakeholder profile
    profile: Mapped[Optional[StakeholderProfile]] = relationship(
        "StakeholderProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    # 1-to-many relationship with owned instruments
    instruments: Mapped[List[Instrument]] = relationship(
        "Instrument", back_populates="owner"
    )

    # 1-to-many relationship with submitted applications
    applications: Mapped[List[VerificationApplication]] = relationship(
        "VerificationApplication", back_populates="applicant"
    )

    # Status history changes recorded by this user
    status_changes: Mapped[List[ApplicationStatusHistory]] = relationship(
        "ApplicationStatusHistory", back_populates="changed_by"
    )

    # Inspections assigned to this officer/verifier
    assigned_inspections: Mapped[List[Inspection]] = relationship(
        "Inspection", back_populates="assigned_to"
    )

    # Certificates issued by this officer/admin
    issued_certificates: Mapped[List[Certificate]] = relationship(
        "Certificate", back_populates="issued_by"
    )

    # In-app notifications for this user
    notifications: Mapped[List[Notification]] = relationship(
        "Notification", back_populates="user", cascade="all, delete-orphan"
    )


class StakeholderProfile(Base, TimestampMixin):
    """Business/stakeholder profile for instrument owners, businesses, or labs."""
    __tablename__ = "stakeholder_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )
    business_name: Mapped[str] = mapped_column(String(255), nullable=False)
    trade_license_number: Mapped[Optional[str]] = mapped_column(
        String(100), index=True, nullable=True
    )
    contact_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    address_line: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    pincode: Mapped[str] = mapped_column(String(10), nullable=False)

    user: Mapped[User] = relationship("User", back_populates="profile")
