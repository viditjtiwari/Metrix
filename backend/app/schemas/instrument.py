from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.enums import InstrumentType


class InstrumentCreate(BaseModel):
    """Schema for registering a new instrument."""
    instrument_type: InstrumentType
    manufacturer: str = Field(..., min_length=2, max_length=128)
    model_name: str = Field(..., min_length=1, max_length=128)
    serial_number: str = Field(..., min_length=1, max_length=128)
    capacity: Optional[str] = Field(None, max_length=64)
    min_capacity: Optional[str] = Field(None, max_length=64)
    max_capacity: Optional[str] = Field(None, max_length=64)
    capacity_unit: Optional[str] = Field(None, max_length=16)
    location: str = Field(..., min_length=3, max_length=255)


class InstrumentUpdate(BaseModel):
    """Schema for updating an existing instrument."""
    model_name: Optional[str] = Field(None, min_length=1, max_length=128)
    capacity: Optional[str] = Field(None, max_length=64)
    min_capacity: Optional[str] = Field(None, max_length=64)
    max_capacity: Optional[str] = Field(None, max_length=64)
    capacity_unit: Optional[str] = Field(None, max_length=16)
    location: Optional[str] = Field(None, min_length=3, max_length=255)


class InstrumentResponse(BaseModel):
    """Schema for instrument details response."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    registration_number: str
    owner_id: int
    instrument_type: InstrumentType
    manufacturer: str
    model_name: str
    serial_number: str
    capacity: Optional[str] = None
    min_capacity: Optional[str] = None
    max_capacity: Optional[str] = None
    capacity_unit: Optional[str] = None
    location: str
    image_urls: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class InstrumentListResponse(BaseModel):
    """Schema for paginated instruments list response."""
    items: List[InstrumentResponse]
    total: int
    page: int
    page_size: int


class BatchUploadErrorItem(BaseModel):
    """Details of a failed row in a batch upload."""
    row: int
    serial_number: Optional[str] = None
    error: str


class BatchInstrumentUploadResponse(BaseModel):
    """Summary of batch CSV instrument upload."""
    total_processed: int
    successful_count: int
    failed_count: int
    created_instruments: List[InstrumentResponse]
    errors: List[BatchUploadErrorItem]
