from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.models.enums import NotificationType


class NotificationResponse(BaseModel):
    """Schema for returning in-app notification data."""
    id: int
    user_id: int
    type: NotificationType
    title: str
    message: str
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class NotificationListResponse(BaseModel):
    """Paginated collection of user notifications with unread counter."""
    items: List[NotificationResponse]
    total: int
    unread_count: int
    page: int
    page_size: int


class NotificationReadResponse(BaseModel):
    """Result of marking a single notification as read."""
    id: int
    is_read: bool
    read_at: Optional[datetime] = None


class NotificationBatchReadResponse(BaseModel):
    """Result of marking all notifications as read."""
    updated_count: int
