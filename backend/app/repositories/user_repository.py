from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
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


user_repository = UserRepository()
