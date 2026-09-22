from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import (
    GoogleAuthRequest,
    GoogleAuthURLResponse,
    LoginRequest,
    OTPSendRequest,
    OTPVerifyRequest,
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
    """Register a new user account (always as INSTRUMENT_OWNER)."""
    user = auth_service.register_user(db, user_in)
    return UserResponse.model_validate(user)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User Login (Email + Password)",
)
def login(
    credentials: LoginRequest, db: Session = Depends(get_db)
) -> TokenResponse:
    """Authenticate user credentials and return signed JWT access token."""
    return auth_service.authenticate_user(db, credentials)


# ── OTP Login ───────────────────────────────────────────────────

@router.post(
    "/otp/send",
    status_code=status.HTTP_200_OK,
    summary="Send OTP to Email",
)
def send_otp(
    otp_req: OTPSendRequest, db: Session = Depends(get_db)
):
    """Send a one-time password to the user's registered email."""
    return auth_service.send_otp(db, otp_req)


@router.post(
    "/otp/verify",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify OTP and Login",
)
def verify_otp(
    otp_req: OTPVerifyRequest, db: Session = Depends(get_db)
) -> TokenResponse:
    """Verify the OTP code and return a JWT access token."""
    return auth_service.verify_otp(db, otp_req)


# ── Google OAuth ────────────────────────────────────────────────

@router.get(
    "/google/url",
    response_model=GoogleAuthURLResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Google OAuth URL",
)
def get_google_url() -> GoogleAuthURLResponse:
    """Return the Google OAuth consent screen URL."""
    url = auth_service.get_google_auth_url()
    return GoogleAuthURLResponse(auth_url=url)


@router.post(
    "/google",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Google OAuth Login",
)
def google_login(
    auth_req: GoogleAuthRequest, db: Session = Depends(get_db)
) -> TokenResponse:
    """Exchange Google authorization code for a JWT access token."""
    return auth_service.google_authenticate(db, auth_req)


# ── Profile ─────────────────────────────────────────────────────

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
