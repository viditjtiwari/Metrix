from datetime import date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.enums import InspectionMode, InspectionResult


# ── Structured Government Checklist Schemas ──


class PhysicalInspectionChecklist(BaseModel):
    """Government-standard physical inspection checklist with checkboxes.

    Each field maps to a Yes/No checkbox that the inspecting officer fills.
    """
    seal_intact: bool = Field(
        ..., description="Manufacturer's seal intact? (Yes/No)"
    )
    display_readable: bool = Field(
        ..., description="Display readability OK? (Yes/No)"
    )
    leveling_ok: bool = Field(
        True, description="Leveling correct? (for platform scales)"
    )
    power_stable: bool = Field(
        True, description="Power supply stable? (for electronic instruments)"
    )
    overall_condition: str = Field(
        "Good", description="Overall condition: Good / Fair / Poor"
    )
    remarks: Optional[str] = Field(
        None, description="Inspector's free-text remarks"
    )


class SpanTestPoint(BaseModel):
    """Single span test measurement at a load point (25%, 50%, 75%, 100%)."""
    load_percentage: int = Field(
        ..., description="Load as % of capacity (e.g. 25, 50, 75, 100)"
    )
    standard_value: str = Field(..., description="Expected value")
    observed_value: str = Field(..., description="Measured value")
    error: Optional[str] = Field(None, description="Error amount")
    mpe_limit: Optional[str] = Field(None, description="MPE limit")
    is_passed: bool = True


class EccentricityReading(BaseModel):
    """Eccentricity test reading at a specific position."""
    position: str = Field(
        ...,
        description="Position: center, front_left, front_right, "
                    "rear_left, rear_right",
    )
    observed_value: str


class MetrologicalTestData(BaseModel):
    """Structured metrological test data per OIML R76 standard.

    Covers all mandatory test types: zero error, span, eccentricity,
    discrimination, and repeatability.
    """
    # Zero Error Test
    zero_error_expected: Optional[str] = "0"
    zero_error_observed: Optional[str] = None
    zero_error_passed: bool = True
    # Span Test (multiple load points)
    span_tests: List[SpanTestPoint] = []
    # Eccentricity Test
    eccentricity_readings: List[EccentricityReading] = []
    eccentricity_variation: Optional[str] = None
    eccentricity_mpe: Optional[str] = None
    eccentricity_passed: bool = True
    # Discrimination Test
    discrimination_initial_load: Optional[str] = None
    discrimination_added_weight: Optional[str] = None
    discrimination_final_reading: Optional[str] = None
    discrimination_passed: bool = True
    # Repeatability Test
    repeatability_readings: List[str] = []
    repeatability_variation: Optional[str] = None
    repeatability_passed: bool = True
    # Instrument class for MPE calculation
    instrument_class: Optional[str] = Field(
        None, description="OIML class: I, II, III, or IIII"
    )


# ── Request Schemas ──


class ScheduleRequest(BaseModel):
    """Schema for scheduling an inspection for an application."""
    scheduled_date: date
    scheduled_time: Optional[str] = Field(
        None, max_length=32, description="e.g. 10:30 AM"
    )
    inspection_location: Optional[str] = Field(
        None, max_length=255,
        description="Premises or testing lab location",
    )
    scheduling_remarks: Optional[str] = None
    assigned_to_id: Optional[int] = None
    inspection_mode: Optional[InspectionMode] = None


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


class InspectionChecklistSubmit(BaseModel):
    """Schema for submitting the full structured inspection checklist.

    The inspecting officer fills this form during field/lab inspection.
    """
    physical_inspection: PhysicalInspectionChecklist
    metrological_tests: Optional[MetrologicalTestData] = None
    observations: List[ObservationCreate] = []
    seal_number: Optional[str] = Field(
        None, max_length=64,
        description="Physical seal number (if instrument passed)",
    )
    result: InspectionResult
    result_remarks: Optional[str] = None


class InspectionResultUpdate(BaseModel):
    """Schema for finalizing inspection outcome."""
    result: InspectionResult
    remarks: Optional[str] = None
    seal_number: Optional[str] = Field(
        None, max_length=64,
        description="Physical seal number affixed on instrument",
    )


# ── GATC Report Schemas ──


class GATCReportSubmit(BaseModel):
    """Schema for GATC uploading their test report & recommendation."""
    gatc_test_report_url: str = Field(
        ..., description="URL of uploaded GATC test report PDF"
    )
    gatc_recommendation: str = Field(
        ..., description="CERTIFY or REJECT"
    )
    observations: List[ObservationCreate] = []


class LMOApprovalUpdate(BaseModel):
    """Schema for LMO reviewing and approving/rejecting GATC report."""
    lmo_approval_status: str = Field(
        ..., description="APPROVED, CLARIFICATION_ASKED, or REJECTED"
    )
    lmo_approval_remarks: Optional[str] = None


# ── Response Schemas ──


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


class InspectionResponse(BaseModel):
    """Schema for inspection summary response."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    application_id: int
    assigned_to_id: Optional[int] = None
    inspection_mode: Optional[str] = None
    scheduled_date: Optional[date] = None
    scheduled_time: Optional[str] = None
    inspection_location: Optional[str] = None
    scheduling_remarks: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    result: Optional[InspectionResult] = None
    result_remarks: Optional[str] = None
    seal_number: Optional[str] = None
    stamp_quarter: Optional[str] = None
    image_urls: Optional[str] = None
    certificate_image_url: Optional[str] = None
    physical_inspection_data: Optional[str] = None
    metrological_test_data: Optional[str] = None
    gatc_test_report_url: Optional[str] = None
    gatc_recommendation: Optional[str] = None
    lmo_approval_status: Optional[str] = None
    lmo_approval_remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class InspectionDetailResponse(InspectionResponse):
    """Schema for detailed response including observations and officer."""
    observations: List[ObservationResponse] = []
    assigned_to_name: Optional[str] = None
    assigned_to_role: Optional[str] = None


class InspectionListItem(InspectionResponse):
    """Schema for inspection in list view with officer and app number."""
    assigned_to_name: Optional[str] = None
    assigned_to_role: Optional[str] = None
    application_number: Optional[str] = None


class InspectionListResponse(BaseModel):
    """Paginated list of inspections."""
    items: List[InspectionListItem]
    total: int
    page: int
    page_size: int

