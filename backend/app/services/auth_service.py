from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.repositories.user_repository import user_repository
from app.schemas.auth import LoginRequest, TokenResponse, UserCreate, UserResponse


class AuthService:
    """Service handling business logic for registration and authentication."""

    def register_user(self, db: Session, user_data: UserCreate) -> User:
        existing = user_repository.get_by_email(db, user_data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email is already registered.",
            )

        hashed_password = get_password_hash(user_data.password)
        user = user_repository.create(
            db,
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
            role=user_data.role.value,
        )

        if user_data.profile:
            user_repository.create_profile(
                db, user_id=user.id, profile_data=user_data.profile
            )

        db.commit()
        db.refresh(user)
        return user

    def authenticate_user(self, db: Session, credentials: LoginRequest) -> TokenResponse:
        user = user_repository.get_by_email(db, credentials.email)
        if not user or not verify_password(credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This user account has been deactivated.",
            )

        access_token = create_access_token(
            subject=user.id,
            extra_claims={"role": user.role.value, "email": user.email},
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )

    def get_current_user_profile(self, db: Session, user_id: int) -> User:
        user = user_repository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )
        return user


auth_service = AuthService()
