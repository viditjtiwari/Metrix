from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.enums import ApplicationStatus, PaymentStatus
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


class PaymentReceiptSubmit(BaseModel):
    """Schema for applicant uploading treasury / SBI e-pay challan receipt."""
    challan_reference_number: str = Field(..., min_length=3, max_length=64)
    challan_date: Optional[date] = None
    payment_receipt_url: str = Field(..., max_length=512)
    calculated_fee: int = Field(0, ge=0)
    late_fee: int = Field(0, ge=0)
    total_fee: int = Field(0, ge=0)


class PaymentVerificationSubmit(BaseModel):
    """Schema for LMO / Admin verification of manual challan receipt."""
    is_verified: bool = Field(..., description="True if receipt is verified, False if rejected")
    remarks: Optional[str] = Field(None, description="Officer verification remarks or reason for rejection")


class ClarificationRequestSubmit(BaseModel):
    """Schema for LMO requesting clarification from applicant."""
    remarks: str = Field(..., min_length=5, description="Specific clarification query or documents required")


class ClarificationResponseSubmit(BaseModel):
    """Schema for applicant submitting response to clarification."""
    remarks: str = Field(..., min_length=2, description="Applicant response explanation and corrective action")


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

    # Payment tracking
    payment_status: PaymentStatus = PaymentStatus.PENDING
    payment_receipt_url: Optional[str] = None
    challan_reference_number: Optional[str] = None
    challan_date: Optional[date] = None
    calculated_fee: int = 0
    late_fee: int = 0
    total_fee: int = 0
    payment_uploaded_at: Optional[datetime] = None
    payment_verified_at: Optional[datetime] = None
    payment_remarks: Optional[str] = None

    created_at: datetime
    updated_at: datetime


class ApplicationDetailResponse(ApplicationResponse):
    """Schema for verification application detailed response including
    audit history, applicant info, and instrument details."""
    status_history: List[StatusHistoryResponse] = []
    inspection: Optional[InspectionResponse] = None

    # Enriched applicant info (populated by the router)
    applicant_name: Optional[str] = None
    applicant_email: Optional[str] = None
    applicant_business_name: Optional[str] = None
    applicant_phone: Optional[str] = None

    # Enriched instrument info (populated by the router)
    instrument_registration_number: Optional[str] = None
    instrument_type: Optional[str] = None
    instrument_manufacturer: Optional[str] = None
    instrument_model: Optional[str] = None
    instrument_serial_number: Optional[str] = None
    instrument_capacity: Optional[str] = None
    instrument_location: Optional[str] = None


class ApplicationListResponse(BaseModel):
    """Schema for paginated applications list response."""
    items: List[ApplicationResponse]
    total: int
    page: int
    page_size: int
