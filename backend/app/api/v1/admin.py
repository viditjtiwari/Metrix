from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, require_role
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.admin import (
    AdminUserCreate,
    UserListItem,
    UserListResponse,
    UserRoleUpdate,
    UserStatusUpdate,
)
from app.services.admin_service import admin_service

router = APIRouter(prefix="/admin", tags=["Admin Management"])


@router.get(
    "/users",
    response_model=UserListResponse,
    status_code=status.HTTP_200_OK,
    summary="List and Search System Users (Admin Only)",
)
def list_users(
    query: Optional[str] = Query(None, description="Search by name or email"),
    role: Optional[UserRole] = Query(None, description="Filter by user role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role(UserRole.ADMIN)),
) -> UserListResponse:
    """Retrieve system users with optional role and status filters."""
    return admin_service.list_users(
        db,
        query=query,
        role=role,
        is_active=is_active,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/users/{user_id}",
    response_model=UserListItem,
    status_code=status.HTTP_200_OK,
    summary="Get User Details (Admin Only)",
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role(UserRole.ADMIN)),
) -> UserListItem:
    """Retrieve details of a single user account."""
    return admin_service.get_user(db, user_id=user_id)


@router.patch(
    "/users/{user_id}/status",
    response_model=UserListItem,
    status_code=status.HTTP_200_OK,
    summary="Update User Active Status (Admin Only)",
)
def update_user_status(
    user_id: int,
    status_in: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role(UserRole.ADMIN)),
) -> UserListItem:
    """Activate or deactivate a user account."""
    return admin_service.update_user_status(
        db,
        user_id=user_id,
        is_active=status_in.is_active,
        current_admin=current_admin,
    )


@router.patch(
    "/users/{user_id}/role",
    response_model=UserListItem,
    status_code=status.HTTP_200_OK,
    summary="Change User Role (Admin Only)",
)
def update_user_role(
    user_id: int,
    role_in: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role(UserRole.ADMIN)),
) -> UserListItem:
    """Change the role of a user account."""
    return admin_service.update_user_role(
        db,
        user_id=user_id,
        new_role=role_in.role,
        current_admin=current_admin,
    )


@router.post(
    "/users",
    response_model=UserListItem,
    status_code=status.HTTP_201_CREATED,
    summary="Create Official User Account (Admin Only)",
)
def create_official_user(
    user_in: AdminUserCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role(UserRole.ADMIN)),
) -> UserListItem:
    """Provision a new LMO, GATC, or Admin user account."""
    return admin_service.create_user(db, user_in=user_in)
