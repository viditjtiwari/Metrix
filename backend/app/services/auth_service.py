import random
import string
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.user_repository import user_repository
from app.schemas.auth import (
    GoogleAuthRequest,
    LoginRequest,
    OTPSendRequest,
    OTPVerifyRequest,
    PasswordChangeRequest,
    ProfileUpdate,
    TokenResponse,
    UserCreate,
    UserResponse,
)
from app.services.email_service import send_otp_email


class AuthService:
    """Service handling business logic for registration and authentication."""

    # ── Registration (role locked to INSTRUMENT_OWNER) ──────────────

    def register_user(self, db: Session, user_data: UserCreate) -> User:
        existing = user_repository.get_by_email(db, user_data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email is already registered.",
            )

        # Force role to INSTRUMENT_OWNER for public registration
        forced_role = UserRole.INSTRUMENT_OWNER

        hashed_password = get_password_hash(user_data.password)
        user = user_repository.create(
            db,
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
            role=forced_role.value,
        )

        if user_data.profile:
            user_repository.create_profile(
                db, user_id=user.id, profile_data=user_data.profile
            )

        db.commit()
        db.refresh(user)
        return user

    # ── Email + Password Login ──────────────────────────────────────

    def authenticate_user(self, db: Session, credentials: LoginRequest) -> TokenResponse:
        user = user_repository.get_by_email(db, credentials.email)
        if not user or not user.hashed_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not verify_password(credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return self._issue_token(user)

    # ── OTP Login ───────────────────────────────────────────────────

    def send_otp(self, db: Session, otp_req: OTPSendRequest) -> dict:
        """Generate and send a 6-digit OTP to the user's email."""
        user = user_repository.get_by_email(db, otp_req.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found with this email address.",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This user account has been deactivated.",
            )

        otp_code = "".join(random.choices(string.digits, k=settings.OTP_LENGTH))
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

        user_repository.set_otp(db, user.id, otp_code, expires_at)
        db.commit()

        sent = send_otp_email(otp_req.email, otp_code)
        if not sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send OTP email. Please try again.",
            )

        return {"message": f"OTP sent to {otp_req.email}"}

    def verify_otp(self, db: Session, otp_req: OTPVerifyRequest) -> TokenResponse:
        """Verify the OTP code and return a JWT token."""
        user = user_repository.get_by_email(db, otp_req.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or OTP.",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This user account has been deactivated.",
            )
        if not user.otp_code or not user.otp_expires_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No OTP was requested for this account.",
            )
        if datetime.now(timezone.utc) > user.otp_expires_at:
            user_repository.clear_otp(db, user.id)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP has expired. Please request a new one.",
            )
        if user.otp_code != otp_req.otp_code:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid OTP code.",
            )

        user_repository.clear_otp(db, user.id)
        db.commit()
        return self._issue_token(user)

    # ── Google OAuth ────────────────────────────────────────────────

    def get_google_auth_url(self) -> str:
        """Build the Google OAuth2 consent screen URL."""
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent",
        }
        return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"

    def google_authenticate(
        self, db: Session, auth_req: GoogleAuthRequest
    ) -> TokenResponse:
        """Exchange Google auth code for user info, create/find user, return JWT."""
        token_data = self._exchange_google_code(auth_req.code)
        user_info = self._get_google_user_info(token_data["access_token"])

        email = user_info.get("email", "")
        full_name = user_info.get("name", email.split("@")[0])

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not retrieve email from Google account.",
            )

        user = user_repository.create_or_get_google_user(
            db, email=email, full_name=full_name
        )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This user account has been deactivated.",
            )
        db.commit()
        db.refresh(user)
        return self._issue_token(user)

    # ── Profile & Password ──────────────────────────────────────────

    def get_current_user_profile(self, db: Session, user_id: int) -> User:
        user = user_repository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )
        return user

    def update_profile(
        self, db: Session, current_user: User, profile_in: ProfileUpdate
    ) -> User:
        if profile_in.full_name is not None:
            user_repository.update_user(
                db, current_user.id, full_name=profile_in.full_name.strip()
            )

        profile_fields = {
            k: v
            for k, v in profile_in.model_dump(exclude_unset=True).items()
            if k != "full_name" and v is not None
        }
        if profile_fields:
            user_repository.update_profile(db, current_user.id, profile_fields)

        db.commit()
        refreshed = user_repository.get_by_id(db, current_user.id)
        return refreshed

    def change_password(
        self, db: Session, current_user: User, password_in: PasswordChangeRequest
    ) -> None:
        if not verify_password(password_in.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect.",
            )
        hashed = get_password_hash(password_in.new_password)
        user_repository.update_user(db, current_user.id, hashed_password=hashed)
        db.commit()

    # ── Private Helpers ─────────────────────────────────────────────

    def _issue_token(self, user: User) -> TokenResponse:
        """Create JWT and wrap in TokenResponse."""
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

    def _exchange_google_code(self, code: str) -> dict:
        """Exchange authorization code for Google tokens."""
        resp = httpx.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
            timeout=10.0,
        )
        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange Google authorization code.",
            )
        return resp.json()

    def _get_google_user_info(self, access_token: str) -> dict:
        """Fetch user profile from Google using the access token."""
        resp = httpx.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10.0,
        )
        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch Google user information.",
            )
        return resp.json()


auth_service = AuthService()
