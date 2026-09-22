from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    PasswordChangeRequest,
    ProfileUpdate,
    TokenResponse,
    UserCreate,
    UserResponse,
)
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="User Registration",
)
def register(
    user_in: UserCreate, db: Session = Depends(get_db)
) -> UserResponse:
    """Register a new user account with optional stakeholder profile."""
    user = auth_service.register_user(db, user_in)
    return UserResponse.model_validate(user)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User Login",
)
def login(
    credentials: LoginRequest, db: Session = Depends(get_db)
) -> TokenResponse:
    """Authenticate user credentials and return signed JWT access token."""
    return auth_service.authenticate_user(db, credentials)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Current User Profile",
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Retrieve identity and profile details of the authenticated user."""
    return UserResponse.model_validate(current_user)


@router.patch(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Profile",
)
def update_me(
    profile_in: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Update profile and contact information for the authenticated user."""
    user = auth_service.update_profile(db, current_user=current_user, profile_in=profile_in)
    return UserResponse.model_validate(user)


@router.patch(
    "/me/password",
    status_code=status.HTTP_200_OK,
    summary="Change Password",
)
def change_password(
    password_in: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Change the password of the currently authenticated user."""
    auth_service.change_password(db, current_user=current_user, password_in=password_in)
    return {"message": "Password changed successfully."}
