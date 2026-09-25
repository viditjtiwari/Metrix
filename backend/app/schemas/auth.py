from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.enums import UserRole


class StakeholderProfileCreate(BaseModel):
    """Schema for creating a stakeholder profile."""
    business_name: str = Field(..., min_length=2, max_length=255)
    trade_license_number: Optional[str] = Field(None, max_length=100)
    contact_phone: str = Field(..., min_length=7, max_length=20)
    address_line: str = Field(..., min_length=3, max_length=255)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    pincode: str = Field(..., min_length=4, max_length=10)
    # KYC Fields
    gstin: Optional[str] = Field(None, max_length=15)
    pan: Optional[str] = Field(None, max_length=10)
    business_type: Optional[str] = Field(None, max_length=32)
    aadhaar_reference: Optional[str] = Field(None, max_length=32)


class StakeholderProfileResponse(BaseModel):
    """Schema for stakeholder profile response."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    business_name: Optional[str] = None
    trade_license_number: Optional[str] = None
    contact_phone: str
    address_line: str
    city: str
    state: str
    pincode: str
    gstin: Optional[str] = None
    pan: Optional[str] = None
    business_type: Optional[str] = None
    aadhaar_reference: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class UserCreate(BaseModel):
    """Schema for user registration. Role is always INSTRUMENT_OWNER for public."""
    email: str = Field(..., min_length=5, max_length=255, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(..., min_length=6, max_length=100)
    full_name: str = Field(..., min_length=2, max_length=255)
    role: UserRole = UserRole.INSTRUMENT_OWNER
    profile: Optional[StakeholderProfileCreate] = None


class UserResponse(BaseModel):
    """Schema for user response (never exposes password hash)."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    auth_provider: str = "local"
    profile: Optional[StakeholderProfileResponse] = None
    created_at: datetime
    updated_at: datetime


class LoginRequest(BaseModel):
    """Schema for user login credentials."""
    email: str = Field(..., min_length=5, max_length=255, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str


class TokenResponse(BaseModel):
    """Schema for JWT authentication response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ProfileUpdate(BaseModel):
    """Schema for updating user personal and business profile."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    business_name: Optional[str] = Field(None, min_length=2, max_length=255)
    trade_license_number: Optional[str] = Field(None, max_length=100)
    contact_phone: Optional[str] = Field(None, min_length=7, max_length=20)
    address_line: Optional[str] = Field(None, min_length=3, max_length=255)
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    state: Optional[str] = Field(None, min_length=2, max_length=100)
    pincode: Optional[str] = Field(None, min_length=4, max_length=10)
    gstin: Optional[str] = Field(None, max_length=15)
    pan: Optional[str] = Field(None, max_length=10)
    business_type: Optional[str] = Field(None, max_length=32)
    aadhaar_reference: Optional[str] = Field(None, max_length=32)


class PasswordChangeRequest(BaseModel):
    """Schema for authenticated password change."""
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6, max_length=100)


# --- OTP Login Schemas ---

class OTPSendRequest(BaseModel):
    """Schema for requesting an OTP to be sent to an email."""
    email: str = Field(..., min_length=5, max_length=255, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class OTPVerifyRequest(BaseModel):
    """Schema for verifying an OTP code."""
    email: str = Field(..., min_length=5, max_length=255, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    otp_code: str = Field(..., min_length=6, max_length=6)


# --- Google OAuth Schemas ---

class GoogleAuthRequest(BaseModel):
    """Schema for exchanging Google authorization code for JWT."""
    code: str = Field(..., description="Authorization code from Google OAuth redirect")


class GoogleAuthURLResponse(BaseModel):
    """Schema for returning the Google OAuth consent URL."""
    auth_url: str
