from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.enums import InspectionResult


class ScheduleRequest(BaseModel):
    """Schema for scheduling an inspection for an application."""
    scheduled_date: date
    scheduled_time: Optional[str] = Field(None, max_length=32, description="e.g. 10:30 AM")
    inspection_location: Optional[str] = Field(None, max_length=255, description="Premises or testing lab location")
    scheduling_remarks: Optional[str] = None
    assigned_to_id: Optional[int] = None


class AssignmentRequest(BaseModel):
    """Schema for assigning an officer or GATC verifier."""
    assigned_to_id: int


class ObservationCreate(BaseModel):
    """Schema for recording a testing observation during inspection."""
    parameter_name: str = Field(..., min_length=1, max_length=128)
    observed_value: str = Field(..., min_length=1, max_length=64)
    standard_value: Optional[str] = Field(None, max_length=64)
    unit: Optional[str] = Field(None, max_length=32)
    is_passed: bool = True
    remarks: Optional[str] = None


class ObservationResponse(BaseModel):
    """Schema for a recorded observation response."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    inspection_id: int
    parameter_name: str
    observed_value: str
    standard_value: Optional[str] = None
    unit: Optional[str] = None
    is_passed: bool
    remarks: Optional[str] = None
    created_at: datetime


class InspectionResultUpdate(BaseModel):
    """Schema for finalizing inspection outcome."""
    result: InspectionResult
    remarks: Optional[str] = None


class InspectionResponse(BaseModel):
    """Schema for inspection summary response."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    application_id: int
    assigned_to_id: Optional[int] = None
    scheduled_date: Optional[date] = None
    scheduled_time: Optional[str] = None
    inspection_location: Optional[str] = None
    scheduling_remarks: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    result: Optional[InspectionResult] = None
    result_remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class InspectionDetailResponse(InspectionResponse):
    """Schema for inspection detailed response including observations and verifier details."""
    observations: List[ObservationResponse] = []
    assigned_to_name: Optional[str] = None
    assigned_to_role: Optional[str] = None
