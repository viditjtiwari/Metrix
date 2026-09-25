import json
from datetime import date, datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db, require_role
from app.models.enums import InspectionResult, UserRole
from app.models.user import User
from app.repositories.inspection_repository import inspection_repository
from app.repositories.user_repository import user_repository
from app.schemas.auth import UserResponse
from app.schemas.inspection import (
    GATCReportSubmit,
    InspectionChecklistSubmit,
    InspectionDetailResponse,
    InspectionListResponse,
    InspectionResultUpdate,
    LMOApprovalUpdate,
    ObservationCreate,
    ObservationResponse,
)
from app.services.inspection_service import inspection_service
from app.services.gatc_service import gatc_service
from app.services.inspection_report_pdf_service import (
    inspection_report_pdf_service,
)

router = APIRouter(prefix="/inspections", tags=["Inspections"])


@router.get(
    "",
    response_model=InspectionListResponse,
    status_code=status.HTTP_200_OK,
    summary="List and Filter Inspections",
)
def list_inspections(
    verifier_id: Optional[int] = Query(
        None, description="Filter by assigned verifier"
    ),
    application_id: Optional[int] = Query(
        None, description="Filter by application ID"
    ),
    result: Optional[InspectionResult] = Query(
        None, description="Filter by outcome (VERIFIED, REJECTED)"
    ),
    scheduled_date_from: Optional[date] = Query(
        None, description="Scheduled on/after (YYYY-MM-DD)"
    ),
    scheduled_date_to: Optional[date] = Query(
        None, description="Scheduled on/before (YYYY-MM-DD)"
    ),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.LMO, UserRole.GATC, UserRole.ADMIN)
    ),
) -> InspectionListResponse:
    """Retrieve inspections queue with date and status filters (LMO/GATC/Admin)."""
    return inspection_service.list_inspections(
        db,
        current_user=current_user,
        verifier_id=verifier_id,
        application_id=application_id,
        result=result,
        scheduled_date_from=scheduled_date_from,
        scheduled_date_to=scheduled_date_to,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/verifiers",
    response_model=List[UserResponse],
    status_code=status.HTTP_200_OK,
    summary="List Available Verifiers (LMO & GATC)",
)
def list_verifiers(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.LMO, UserRole.ADMIN)
    ),
) -> List[UserResponse]:
    """Retrieve list of active officers (LMO) and test centres (GATC) available for assignment."""
    verifiers = user_repository.list_by_roles(
        db, [UserRole.LMO, UserRole.GATC]
    )
    return [UserResponse.model_validate(v) for v in verifiers]


@router.get(
    "/{inspection_id}",
    response_model=InspectionDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Inspection Details",
)
def get_inspection(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InspectionDetailResponse:
    """Retrieve detailed inspection record by ID."""
    inspection = inspection_repository.get_by_id(db, inspection_id)
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection with id {inspection_id} not found.",
        )
    return inspection_service._to_detail_response(inspection)


@router.post(
    "/{inspection_id}/observations",
    response_model=ObservationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record Inspection Observation",
)
def add_observation(
    inspection_id: int,
    obs_in: ObservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ObservationResponse:
    """Record a test observation parameter and result during inspection."""
    return inspection_service.add_observation(
        db,
        inspection_id=inspection_id,
        observation_in=obs_in,
        current_user=current_user,
    )


@router.get(
    "/{inspection_id}/observations",
    response_model=List[ObservationResponse],
    status_code=status.HTTP_200_OK,
    summary="List Inspection Observations",
)
def list_observations(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[ObservationResponse]:
    """List all recorded parameter observations for an inspection."""
    return inspection_service.list_observations(
        db,
        inspection_id=inspection_id,
        current_user=current_user,
    )


@router.patch(
    "/{inspection_id}/result",
    response_model=InspectionDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Record Final Inspection Result",
)
def record_result(
    inspection_id: int,
    result_in: InspectionResultUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InspectionDetailResponse:
    """Record final verification determination (VERIFIED or REJECTED) and advance application lifecycle."""
    return inspection_service.record_result(
        db,
        inspection_id=inspection_id,
        result_in=result_in,
        current_user=current_user,
    )


@router.post(
    "/{inspection_id}/checklist",
    response_model=InspectionDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit Full Inspection Checklist",
)
def submit_checklist(
    inspection_id: int,
    checklist: InspectionChecklistSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.LMO, UserRole.GATC)
    ),
) -> InspectionDetailResponse:
    """Submit structured government-standard inspection checklist.

    Includes physical inspection checkboxes, metrological test data,
    observations, seal number, and final result in one submission.
    """
    return inspection_service.submit_checklist(
        db,
        inspection_id=inspection_id,
        checklist=checklist,
        current_user=current_user,
    )


@router.get(
    "/{inspection_id}/report/download",
    status_code=status.HTTP_200_OK,
    summary="Download Inspection Report PDF",
)
def download_inspection_report(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    """Download government-standard inspection report PDF.

    Role-based access:
    - LMO: Only inspections they conducted
    - GATC: Only inspections they tested
    - ADMIN: All inspections
    - INSTRUMENT_OWNER: Only their own instruments
    """
    inspection = inspection_repository.get_by_id(db, inspection_id)
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection with id {inspection_id} not found.",
        )

    # ── RBAC: check download permission ──
    _check_report_access(inspection, current_user)

    application = inspection.application
    instrument = application.instrument
    owner = instrument.owner
    issuer = (
        application.certificate.issued_by
        if application.certificate else None
    )

    owner_profile = owner.profile if owner else None
    inspector = inspection.assigned_to

    obs_list = [
        {
            "parameter_name": o.parameter_name,
            "observed_value": o.observed_value,
            "standard_value": o.standard_value,
            "unit": o.unit,
            "is_passed": o.is_passed,
        }
        for o in inspection.observations
    ]

    pdf_bytes = inspection_report_pdf_service.generate_report_pdf(
        application_number=application.application_number,
        instrument_registration_number=instrument.registration_number,
        instrument_type=instrument.instrument_type.value,
        manufacturer=instrument.manufacturer,
        model_name=instrument.model_name,
        serial_number=instrument.serial_number,
        capacity=instrument.capacity or "N/A",
        division=instrument.division or "N/A",
        manufacturing_year=instrument.manufacturing_year,
        location=instrument.location,
        owner_name=owner.full_name if owner else "N/A",
        owner_business=(
            owner_profile.business_name if owner_profile else "N/A"
        ),
        owner_address=(
            f"{owner_profile.address_line}, {owner_profile.city}"
            f" - {owner_profile.pincode}"
            if owner_profile else "N/A"
        ),
        inspection_date=(
            inspection.completed_at.strftime("%d-%b-%Y, %I:%M %p")
            if inspection.completed_at
            else (
                inspection.scheduled_date.strftime("%d-%b-%Y")
                if inspection.scheduled_date else "N/A"
            )
        ),
        inspection_mode=(
            inspection.inspection_mode or "LMO_FIELD"
        ),
        inspector_name=(
            inspector.full_name if inspector else "N/A"
        ),
        inspector_designation=(
            "Legal Metrology Officer"
            if inspector and inspector.role == UserRole.LMO
            else "GATC Test Centre"
        ),
        physical_inspection_data=inspection.physical_inspection_data,
        metrological_test_data=inspection.metrological_test_data,
        observations=obs_list,
        overall_result=(
            inspection.result.value if inspection.result else "PENDING"
        ),
        seal_number=inspection.seal_number,
        stamp_quarter=inspection.stamp_quarter,
        result_remarks=inspection.result_remarks,
        issuing_officer_name=(
            issuer.full_name if issuer else None
        ),
    )

    filename = f"RPT-{application.application_number}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )


def _check_report_access(inspection, user: User) -> None:
    """Enforce role-based access control for report downloads."""
    if user.role == UserRole.ADMIN:
        return  # Admin can download any report

    if user.role in (UserRole.LMO, UserRole.GATC):
        if inspection.assigned_to_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only download reports for inspections "
                       "you conducted.",
            )
        return

    if user.role == UserRole.INSTRUMENT_OWNER:
        application = inspection.application
        if application and application.applicant_id == user.id:
            return
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only download reports for your own "
                   "instruments.",
        )

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Insufficient permissions to download this report.",
    )


@router.post(
    "/{inspection_id}/gatc-report",
    response_model=InspectionDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit GATC Laboratory Calibration Report",
)
def submit_gatc_report(
    inspection_id: int,
    report: GATCReportSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.GATC, UserRole.ADMIN)),
) -> InspectionDetailResponse:
    """Submit specialized laboratory testing/calibration report & recommendation (GATC)."""
    return gatc_service.submit_gatc_report(
        db,
        inspection_id=inspection_id,
        report_data=report,
        current_user=current_user,
    )


@router.patch(
    "/{inspection_id}/lmo-approval",
    response_model=InspectionDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="LMO Review & Endorsement of GATC Report",
)
def review_gatc_report(
    inspection_id: int,
    review: LMOApprovalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.LMO, UserRole.ADMIN)),
) -> InspectionDetailResponse:
    """Legal Metrology Officer reviews and approves/rejects GATC calibration report."""
    return gatc_service.review_gatc_report(
        db,
        inspection_id=inspection_id,
        review_data=review,
        current_user=current_user,
    )


