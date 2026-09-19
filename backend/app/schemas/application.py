from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.enums import ApplicationStatus
from app.schemas.inspection import InspectionResponse


class ApplicationCreate(BaseModel):
    """Schema for submitting a verification application."""
    instrument_id: int
    application_type: str = Field("INITIAL", max_length=32)
    remarks: Optional[str] = None
    submit_now: bool = False


class ApplicationStatusUpdate(BaseModel):
    """Schema for updating application workflow status."""
    status: ApplicationStatus
    remarks: Optional[str] = None


class StatusHistoryResponse(BaseModel):
    """Schema for application status history log."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    application_id: int
    from_status: Optional[ApplicationStatus] = None
    to_status: ApplicationStatus
    changed_by_id: int
    remarks: Optional[str] = None
    created_at: datetime


class ApplicationResponse(BaseModel):
    """Schema for verification application summary response."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    application_number: str
    instrument_id: int
    applicant_id: int
    application_type: str
    status: ApplicationStatus
    submitted_at: Optional[datetime] = None
    remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ApplicationDetailResponse(ApplicationResponse):
    """Schema for verification application detailed response including audit history."""
    status_history: List[StatusHistoryResponse] = []
    inspection: Optional[InspectionResponse] = None


class ApplicationListResponse(BaseModel):
    """Schema for paginated applications list response."""
    items: List[ApplicationResponse]
    total: int
    page: int
    page_size: int
