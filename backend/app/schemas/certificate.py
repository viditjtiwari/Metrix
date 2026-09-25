from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.enums import CertificateStatus


class CertificateBase(BaseModel):
    """Base certificate schema fields."""
    certificate_number: str
    valid_from: date
    valid_until: date
    status: CertificateStatus
    integrity_hash: str


class CertificateResponse(CertificateBase):
    """Authenticated response schema for a verification certificate."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    application_id: int
    instrument_id: int
    issued_by_id: int
    issued_at: datetime
    verification_token: str
    pdf_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class CertificateDetailResponse(CertificateResponse):
    """Detailed certificate response including instrument and issuer metadata."""
    instrument_registration_number: Optional[str] = None
    instrument_type: Optional[str] = None
    manufacturer: Optional[str] = None
    model_name: Optional[str] = None
    serial_number: Optional[str] = None
    capacity: Optional[str] = None
    issued_by_name: Optional[str] = None
    application_number: Optional[str] = None
    verification_url: Optional[str] = None


class PublicCertificateVerificationResponse(BaseModel):
    """Public certificate verification result returned without authentication."""
    certificate_number: str
    instrument_registration_number: str
    instrument_type: str
    manufacturer: str
    model: str
    serial_number: Optional[str] = None
    verification_result: str
    issued_at: datetime
    valid_from: date
    valid_until: date
    status: CertificateStatus
    integrity_hash: str


class CertificateIssueRequest(BaseModel):
    """Request payload for issuing a certificate."""
    remarks: Optional[str] = None


class CertificateListResponse(BaseModel):
    """Paginated collection of certificates for search and expiry tracking."""
    items: List[CertificateDetailResponse]
    total: int
    page: int
    page_size: int


class DiscrepancyReportSubmit(BaseModel):
    """Payload for whistleblower / public reporting of suspicious or tampered certificates."""
    discrepancy_type: str = Field(
        ..., description="SEAL_TAMPERED, EXPIRED_IN_USE, SERIAL_MISMATCH, LOCATION_MISMATCH, OTHER"
    )
    description: str = Field(..., min_length=10, max_length=1000)
    reporter_name: Optional[str] = Field(None, max_length=128)
    reporter_phone: Optional[str] = Field(None, max_length=32)
    evidence_image_url: Optional[str] = Field(None, max_length=512)


class DiscrepancyReportResponse(BaseModel):
    """Confirmation response for whistleblower submission."""
    report_reference_id: str
    status: str = "RECEIVED"
    message: str
