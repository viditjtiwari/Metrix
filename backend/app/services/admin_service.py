from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.user_repository import user_repository
from app.schemas.admin import AdminUserCreate, UserListItem, UserListResponse


class AdminService:
    """Service encapsulating administrator user management operations."""

    def list_users(
        self,
        db: Session,
        *,
        query: Optional[str] = None,
        role: Optional[UserRole] = None,
        is_active: Optional[bool] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> UserListResponse:
        users, total = user_repository.search(
            db,
            query=query,
            role=role,
            is_active=is_active,
            page=page,
            page_size=page_size,
        )
        return UserListResponse(
            items=[UserListItem.model_validate(u) for u in users],
            total=total,
            page=page,
            page_size=page_size,
        )

    def get_user(self, db: Session, user_id: int) -> UserListItem:
        user = user_repository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with id {user_id} not found",
            )
        return UserListItem.model_validate(user)

    def update_user_status(
        self, db: Session, user_id: int, is_active: bool, current_admin: User
    ) -> UserListItem:
        if user_id == current_admin.id and not is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Administrators cannot deactivate their own account",
            )
        user = user_repository.update_status(db, user_id, is_active)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with id {user_id} not found",
            )
        db.commit()
        db.refresh(user)
        return UserListItem.model_validate(user)

    def create_user(self, db: Session, user_in: AdminUserCreate) -> UserListItem:
        existing = user_repository.get_by_email(db, user_in.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists",
            )
        hashed_password = get_password_hash(user_in.password)
        new_user = user_repository.create(
            db,
            email=user_in.email,
            hashed_password=hashed_password,
            full_name=user_in.full_name,
            role=user_in.role.value if hasattr(user_in.role, "value") else str(user_in.role),
            is_active=True,
        )
        db.commit()
        db.refresh(new_user)
        return UserListItem.model_validate(new_user)

    def update_user_role(
        self,
        db: Session,
        user_id: int,
        new_role: UserRole,
        current_admin: User,
    ) -> UserListItem:
        """Change a user's role. Admins cannot change their own role."""
        if user_id == current_admin.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Administrators cannot change their own role",
            )
        user = user_repository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with id {user_id} not found",
            )
        user_repository.update_user(db, user_id, role=new_role)
        db.commit()
        refreshed = user_repository.get_by_id(db, user_id)
        return UserListItem.model_validate(refreshed)


admin_service = AdminService()
