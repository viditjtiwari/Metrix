from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload
from app.models.enums import UserRole
from app.models.user import StakeholderProfile, User
from app.schemas.auth import StakeholderProfileCreate


class UserRepository:
    """Repository handling database persistence for users and stakeholder profiles."""

    def get_by_id(self, db: Session, user_id: int) -> Optional[User]:
        stmt = (
            select(User)
            .options(joinedload(User.profile))
            .where(User.id == user_id)
        )
        return db.execute(stmt).scalar_one_or_none()

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        stmt = (
            select(User)
            .options(joinedload(User.profile))
            .where(User.email == email.lower().strip())
        )
        return db.execute(stmt).scalar_one_or_none()

    def create(
        self,
        db: Session,
        *,
        email: str,
        hashed_password: str,
        full_name: str,
        role: str,
        is_active: bool = True,
    ) -> User:
        user = User(
            email=email.lower().strip(),
            hashed_password=hashed_password,
            full_name=full_name.strip(),
            role=role,
            is_active=is_active,
        )
        db.add(user)
        db.flush()
        return user

    def create_profile(
        self,
        db: Session,
        *,
        user_id: int,
        profile_data: StakeholderProfileCreate,
    ) -> StakeholderProfile:
        profile = StakeholderProfile(
            user_id=user_id,
            business_name=profile_data.business_name.strip(),
            trade_license_number=profile_data.trade_license_number.strip() if profile_data.trade_license_number else None,
            contact_phone=profile_data.contact_phone.strip(),
            address_line=profile_data.address_line.strip(),
            city=profile_data.city.strip(),
            state=profile_data.state.strip(),
            pincode=profile_data.pincode.strip(),
        )
        db.add(profile)
        db.flush()
        return profile

    def list_all(
        self, db: Session, skip: int = 0, limit: int = 50
    ) -> List[User]:
        stmt = (
            select(User)
            .options(joinedload(User.profile))
            .offset(skip)
            .limit(limit)
        )
        return list(db.execute(stmt).scalars().all())

    def list_by_roles(self, db: Session, roles: List) -> List[User]:
        stmt = (
            select(User)
            .options(joinedload(User.profile))
            .where(User.role.in_(roles), User.is_active == True)
            .order_by(User.full_name.asc())
        )
        return list(db.execute(stmt).scalars().all())

    def search(
        self,
        db: Session,
        *,
        query: Optional[str] = None,
        role: Optional[UserRole] = None,
        is_active: Optional[bool] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[User], int]:
        filters = []
        if query:
            q = f"%{query.strip()}%"
            filters.append(or_(User.email.ilike(q), User.full_name.ilike(q)))
        if role:
            filters.append(User.role == role)
        if is_active is not None:
            filters.append(User.is_active == is_active)

        count_stmt = select(func.count(User.id))
        if filters:
            count_stmt = count_stmt.where(*filters)
        total = db.execute(count_stmt).scalar() or 0

        stmt = (
            select(User)
            .options(joinedload(User.profile))
            .order_by(User.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        if filters:
            stmt = stmt.where(*filters)
        users = list(db.execute(stmt).scalars().all())
        return users, total

    def update_status(self, db: Session, user_id: int, is_active: bool) -> Optional[User]:
        user = self.get_by_id(db, user_id)
        if not user:
            return None
        user.is_active = is_active
        db.flush()
        return user

    def update_user(self, db: Session, user_id: int, **kwargs: Any) -> Optional[User]:
        user = self.get_by_id(db, user_id)
        if not user:
            return None
        for key, value in kwargs.items():
            if hasattr(user, key) and value is not None:
                setattr(user, key, value)
        db.flush()
        return user

    def update_profile(
        self, db: Session, user_id: int, profile_dict: Dict[str, Any]
    ) -> Optional[StakeholderProfile]:
        user = self.get_by_id(db, user_id)
        if not user:
            return None
        if not user.profile:
            business_name = (
                profile_dict.get("business_name")
                or user.full_name
                or "N/A"
            )
            profile = StakeholderProfile(
                user_id=user_id,
                business_name=business_name.strip() if isinstance(business_name, str) else str(business_name),
                trade_license_number=profile_dict.get("trade_license_number"),
                contact_phone=profile_dict.get("contact_phone", "").strip(),
                address_line=profile_dict.get("address_line", "").strip(),
                city=profile_dict.get("city", "").strip(),
                state=profile_dict.get("state", "").strip(),
                pincode=profile_dict.get("pincode", "").strip(),
            )
            db.add(profile)
        else:
            profile = user.profile
            for key, val in profile_dict.items():
                if hasattr(profile, key) and val is not None:
                    setattr(profile, key, val.strip() if isinstance(val, str) else val)
        db.flush()
        return profile

    def set_otp(
        self, db: Session, user_id: int, otp_code: str, expires_at: datetime
    ) -> None:
        """Store a hashed OTP code and its expiry on the user record."""
        user = self.get_by_id(db, user_id)
        if user:
            user.otp_code = otp_code
            user.otp_expires_at = expires_at
            db.flush()

    def clear_otp(self, db: Session, user_id: int) -> None:
        """Clear OTP fields after successful verification."""
        user = self.get_by_id(db, user_id)
        if user:
            user.otp_code = None
            user.otp_expires_at = None
            db.flush()

    def create_or_get_google_user(
        self, db: Session, *, email: str, full_name: str
    ) -> User:
        """Find existing user by email or create a new Google OAuth user."""
        existing = self.get_by_email(db, email)
        if existing:
            return existing
        user = User(
            email=email.lower().strip(),
            hashed_password=None,
            full_name=full_name.strip(),
            role=UserRole.INSTRUMENT_OWNER,
            is_active=True,
            auth_provider="google",
        )
        db.add(user)
        db.flush()
        return user


user_repository = UserRepository()
