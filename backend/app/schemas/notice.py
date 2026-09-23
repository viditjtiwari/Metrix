from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class NoticeCreate(BaseModel):
    """Schema for creating a departmental notice/announcement."""
    title: str = Field(..., min_length=3, max_length=255)
    content: str = Field(..., min_length=5)


class NoticeUpdate(BaseModel):
    """Schema for updating a notice."""
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    content: Optional[str] = Field(None, min_length=5)
    is_active: Optional[bool] = None


class NoticeResponse(BaseModel):
    """Schema for notice details response."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    is_active: bool
    published_by_id: Optional[int] = None
    publisher_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class NoticeListResponse(BaseModel):
    """Schema for list of notices."""
    items: List[NoticeResponse]
    total: int
