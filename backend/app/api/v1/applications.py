from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, get_db, require_role
from app.models.enums import ApplicationStatus, UserRole
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationDetailResponse,
    ApplicationListResponse,
    ApplicationResponse,
    ApplicationStatusUpdate,
    ClarificationRequestSubmit,
    ClarificationResponseSubmit,
    PaymentReceiptSubmit,
    PaymentVerificationSubmit,
)
from app.schemas.certificate import (
    CertificateDetailResponse,
    CertificateIssueRequest,
)
from app.schemas.inspection import (
    AssignmentRequest,
    InspectionDetailResponse,
    ScheduleRequest,
)
from app.services.application_service import application_service
from app.services.certificate_service import certificate_service
from app.services.inspection_service import inspection_service

router = APIRouter(prefix="/applications", tags=["Verification Applications"])


@router.post(
    "",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Verification Application",
)
def create_application(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.INSTRUMENT_OWNER)
    ),
) -> ApplicationResponse:
    """Create a new verification or re-verification application for an instrument."""
    application = application_service.create_application(
        db, app_data=app_in, current_user=current_user
    )
    return ApplicationResponse.model_validate(application)


@router.get(
    "",
    response_model=ApplicationListResponse,
    status_code=status.HTTP_200_OK,
    summary="List and Search Verification Applications",
)
def list_applications(
    status_filter: Optional[ApplicationStatus] = Query(
        None, alias="status", description="Filter by status"
    ),
    application_number: Optional[str] = Query(None, description="Filter by application number"),
    application_type: Optional[str] = Query(None, description="Filter by application type"),
    instrument_id: Optional[int] = Query(None, description="Filter by instrument ID"),
    instrument_registration_number: Optional[str] = Query(None, description="Filter by instrument registration number"),
    date_from: Optional[date] = Query(None, description="Created on/after (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="Created on/before (YYYY-MM-DD)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApplicationListResponse:
    """List verification applications with search and date range filters."""
    return application_service.list_applications(
        db,
        current_user=current_user,
        status_filter=status_filter,
        application_number=application_number,
        application_type=application_type,
        instrument_id=instrument_id,
        instrument_registration_number=instrument_registration_number,
        date_from=date_from,
        date_to=date_to,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{application_id}",
    response_model=ApplicationDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Verification Application Details",
)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApplicationDetailResponse:
    """Retrieve full details of a verification application including audit status history."""
    return application_service.get_application_detail(
        db, application_id=application_id, current_user=current_user
    )


@router.patch(
    "/{application_id}/status",
    response_model=ApplicationDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Transition Application Status",
)
def transition_status(
    application_id: int,
    status_update: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApplicationDetailResponse:
    """Advance application workflow status with authorization and audit trail enforcement."""
    updated = application_service.transition_status(
        db,
        application_id=application_id,
        target_status=status_update.status,
        current_user=current_user,
        remarks=status_update.remarks,
    )
    return application_service.enrich_application_detail(updated)


@router.patch(
    "/{application_id}/schedule",
    response_model=InspectionDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Schedule Inspection for Application",
)
def schedule_inspection(
    application_id: int,
    schedule_data: ScheduleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.LMO, UserRole.ADMIN)),
) -> InspectionDetailResponse:
    """Schedule inspection date, slot, and premises for an application under review."""
    return inspection_service.schedule_inspection(
        db,
        application_id=application_id,
        schedule_data=schedule_data,
        current_user=current_user,
    )


@router.patch(
    "/{application_id}/assignment",
    response_model=InspectionDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Assign Officer or GATC Verifier",
)
def assign_verifier(
    application_id: int,
    assignment_data: AssignmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.LMO, UserRole.ADMIN)),
) -> InspectionDetailResponse:
    """Assign or reassign an inspection to an authorized LMO officer or GATC laboratory."""
    return inspection_service.assign_verifier(
        db,
        application_id=application_id,
        assignment_data=assignment_data,
        current_user=current_user,
    )


@router.post(
    "/{application_id}/inspection",
    response_model=InspectionDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Start Inspection",
)
def start_inspection(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InspectionDetailResponse:
    """Commence physical verification/testing, transitioning status to INSPECTION_IN_PROGRESS."""
    return inspection_service.start_inspection(
        db,
        application_id=application_id,
        current_user=current_user,
    )


@router.get(
    "/{application_id}/inspection",
    response_model=InspectionDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Application Inspection Details",
)
def get_application_inspection(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InspectionDetailResponse:
    """Retrieve inspection details, observations, and verifier info for an application."""
    return inspection_service.get_inspection_by_application(
        db,
        application_id=application_id,
        current_user=current_user,
    )


@router.post(
    "/{application_id}/certificate",
    response_model=CertificateDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Issue Digital Certificate for Application",
)
def issue_certificate(
    application_id: int,
    issue_data: Optional[CertificateIssueRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.LMO, UserRole.ADMIN)),
) -> CertificateDetailResponse:
    """Issue official verification certificate for an application in VERIFIED status."""
    remarks = issue_data.remarks if issue_data else None
    return certificate_service.issue_certificate(
        db,
        application_id=application_id,
        current_user=current_user,
        remarks=remarks,
    )


@router.get(
    "/{application_id}/certificate",
    response_model=CertificateDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Application Certificate",
)
def get_application_certificate(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CertificateDetailResponse:
    """Retrieve digital certificate associated with this application."""
    return certificate_service.get_certificate_by_application(
        db, application_id=application_id, current_user=current_user
    )


@router.post(
    "/{application_id}/payment-receipt",
    response_model=ApplicationDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload Challan Payment Receipt",
)
def upload_payment_receipt(
    application_id: int,
    receipt_data: PaymentReceiptSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApplicationDetailResponse:
    """Upload treasury / challan payment receipt for application fee verification."""
    updated = application_service.upload_payment_receipt(
        db,
        application_id=application_id,
        receipt_data=receipt_data,
        current_user=current_user,
    )
    return application_service.enrich_application_detail(updated)


@router.patch(
    "/{application_id}/payment-verify",
    response_model=ApplicationDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify or Reject Payment Challan",
)
def verify_payment(
    application_id: int,
    verification_data: PaymentVerificationSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.LMO, UserRole.ADMIN)),
) -> ApplicationDetailResponse:
    """Verify statutory fee payment challan (LMO/Admin) and advance to Under Review."""
    updated = application_service.verify_payment(
        db,
        application_id=application_id,
        verification_data=verification_data,
        current_user=current_user,
    )
    return application_service.enrich_application_detail(updated)


@router.patch(
    "/{application_id}/clarification/request",
    response_model=ApplicationDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Request Clarification from Applicant",
)
def request_clarification(
    application_id: int,
    clarification_data: ClarificationRequestSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.LMO, UserRole.ADMIN)),
) -> ApplicationDetailResponse:
    """Request documentation or data clarification from applicant during scrutiny."""
    updated = application_service.request_clarification(
        db,
        application_id=application_id,
        clarification_data=clarification_data,
        current_user=current_user,
    )
    return application_service.enrich_application_detail(updated)


@router.patch(
    "/{application_id}/clarification/respond",
    response_model=ApplicationDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit Clarification Response",
)
def respond_clarification(
    application_id: int,
    response_data: ClarificationResponseSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApplicationDetailResponse:
    """Applicant response to officer clarification request, resuming scrutiny."""
    updated = application_service.respond_clarification(
        db,
        application_id=application_id,
        response_data=response_data,
        current_user=current_user,
    )
    return application_service.enrich_application_detail(updated)


@router.delete(
    "/{application_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Draft Application",
)
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an application in DRAFT status."""
    application_service.delete_application(
        db, application_id=application_id, current_user=current_user
    )
    return {"success": True, "message": f"Draft application {application_id} deleted successfully."}

