from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, get_db, require_role
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.notification import (
    NotificationBatchReadResponse,
    NotificationListResponse,
    NotificationReadResponse,
)
from app.services.notification_service import notification_service

router = APIRouter(prefix="/notifications", tags=["In-App Notifications"])


@router.get(
    "",
    response_model=NotificationListResponse,
    status_code=status.HTTP_200_OK,
    summary="List User Notifications",
)
def list_notifications(
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> NotificationListResponse:
    """Retrieve chronologically ordered in-app notifications for the authenticated user."""
    return notification_service.list_user_notifications(
        db,
        current_user=current_user,
        is_read=is_read,
        page=page,
        page_size=page_size,
    )


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationReadResponse,
    status_code=status.HTTP_200_OK,
    summary="Mark Notification as Read",
)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> NotificationReadResponse:
    """Mark an individual notification as read."""
    return notification_service.mark_as_read(
        db, notification_id=notification_id, current_user=current_user
    )


@router.patch(
    "/read-all",
    response_model=NotificationBatchReadResponse,
    status_code=status.HTTP_200_OK,
    summary="Mark All Notifications as Read",
)
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> NotificationBatchReadResponse:
    """Mark all unread notifications as read for current user."""
    return notification_service.mark_all_as_read(db, current_user=current_user)


@router.post(
    "/check-expiries",
    status_code=status.HTTP_200_OK,
    summary="Trigger Expiry Notification Check",
)
def check_expiries(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.LMO)),
) -> dict:
    """Administrative trigger to evaluate expiring/expired certificates and send deduplicated alerts."""
    return notification_service.check_and_generate_expiry_notifications(db)
