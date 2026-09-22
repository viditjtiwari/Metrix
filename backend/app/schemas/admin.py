from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.enums import UserRole
from app.schemas.auth import StakeholderProfileResponse


class UserStatusUpdate(BaseModel):
    is_active: bool = Field(..., description="New active status for the user")


class AdminUserCreate(BaseModel):
    email: str = Field(..., min_length=5, max_length=255, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", description="Official user email address")
    password: str = Field(..., min_length=8, description="Initial temporary password")
    full_name: str = Field(..., min_length=2, max_length=255, description="Full legal name")
    role: UserRole = Field(..., description="Assigned role: LMO, GATC, or ADMIN")


class UserListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime
    profile: Optional[StakeholderProfileResponse] = None


class UserListResponse(BaseModel):
    items: List[UserListItem]
    total: int
    page: int
    page_size: int


class UserRoleUpdate(BaseModel):
    """Schema for admin role change."""
    role: UserRole = Field(..., description="New role: INSTRUMENT_OWNER, LMO, GATC, or ADMIN")

