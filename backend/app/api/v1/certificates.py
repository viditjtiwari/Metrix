import random
import string
from datetime import date, datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, get_db, require_role
from app.models.enums import CertificateStatus, NotificationType, UserRole
from app.models.discrepancy_report import DiscrepancyReport
from app.models.user import User
from app.repositories.user_repository import user_repository
from app.repositories.discrepancy_report_repository import discrepancy_report_repository
from app.repositories.certificate_repository import certificate_repository
from app.schemas.certificate import (
    CertificateDetailResponse,
    CertificateListResponse,
    DiscrepancyReportActionRequest,
    DiscrepancyReportDetailResponse,
    DiscrepancyReportListResponse,
    DiscrepancyReportResponse,
    DiscrepancyReportSubmit,
    PublicCertificateVerificationResponse,
)
from app.services.certificate_service import certificate_service
from app.services.notification_service import notification_service

router = APIRouter(tags=["Digital Certificates"])


@router.get(
    "/certificates",
    response_model=CertificateListResponse,
    status_code=status.HTTP_200_OK,
    summary="List and Search Certificates",
)
def list_certificates(
    certificate_number: Optional[str] = Query(None, description="Filter by certificate number"),
    instrument_id: Optional[int] = Query(None, description="Filter by instrument ID"),
    instrument_registration_number: Optional[str] = Query(None, description="Filter by instrument registration number"),
    status: Optional[CertificateStatus] = Query(None, description="Filter by status (ACTIVE, EXPIRED)"),
    issue_date_from: Optional[date] = Query(None, description="Issued on/after (YYYY-MM-DD)"),
    issue_date_to: Optional[date] = Query(None, description="Issued on/before (YYYY-MM-DD)"),
    expiry_date_from: Optional[date] = Query(None, description="Valid until on/after (YYYY-MM-DD)"),
    expiry_date_to: Optional[date] = Query(None, description="Valid until on/before (YYYY-MM-DD)"),
    owner_id: Optional[int] = Query(None, description="Filter by owner ID (Admins/LMO only)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CertificateListResponse:
    """Retrieve filtered certificates obeying RBAC ownership constraints."""
    return certificate_service.search_certificates(
        db,
        current_user=current_user,
        certificate_number=certificate_number,
        instrument_id=instrument_id,
        instrument_registration_number=instrument_registration_number,
        status=status,
        issue_date_from=issue_date_from,
        issue_date_to=issue_date_to,
        expiry_date_from=expiry_date_from,
        expiry_date_to=expiry_date_to,
        owner_id=owner_id,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/certificates/expiring",
    response_model=CertificateListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Certificates Expiring Soon",
)
def list_expiring_certificates(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CertificateListResponse:
    """Retrieve active certificates entering warning period (configured via settings)."""
    return certificate_service.list_expiring_certificates(
        db, current_user=current_user, page=page, page_size=page_size
    )


@router.get(
    "/certificates/expired",
    response_model=CertificateListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Expired Certificates",
)
def list_expired_certificates(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CertificateListResponse:
    """Retrieve expired certificates respecting user ownership."""
    return certificate_service.list_expired_certificates(
        db, current_user=current_user, page=page, page_size=page_size
    )


@router.get(
    "/certificates/{certificate_id}",
    response_model=CertificateDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Certificate Details",
)
def get_certificate(
    certificate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CertificateDetailResponse:
    """Retrieve detailed verification certificate information for authorized stakeholders."""
    return certificate_service.get_certificate(
        db, certificate_id=certificate_id, current_user=current_user
    )


@router.get(
    "/certificates/{certificate_id}/download",
    status_code=status.HTTP_200_OK,
    summary="Download Certificate PDF",
)
def download_certificate(
    certificate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    """Download the official ReportLab-rendered PDF certificate."""
    pdf_bytes, filename = certificate_service.download_certificate(
        db, certificate_id=certificate_id, current_user=current_user
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache",
        },
    )


@router.get(
    "/public/certificates/verify/{verification_token}",
    response_model=PublicCertificateVerificationResponse,
    status_code=status.HTTP_200_OK,
    summary="Public QR Certificate Verification",
)
def verify_certificate_public(
    verification_token: str,
    db: Session = Depends(get_db),
) -> PublicCertificateVerificationResponse:
    """Public, unauthenticated verification endpoint called via QR code scan or portal lookup."""
    return certificate_service.verify_public_token(db, token=verification_token)


@router.get(
    "/public/certificates/lookup/{certificate_number}",
    response_model=PublicCertificateVerificationResponse,
    status_code=status.HTTP_200_OK,
    summary="Public Certificate Lookup by Number",
)
def lookup_certificate_public(
    certificate_number: str,
    db: Session = Depends(get_db),
) -> PublicCertificateVerificationResponse:
    """Public, unauthenticated lookup endpoint for verifying certificates by certificate number."""
    return certificate_service.verify_by_certificate_number(db, certificate_number=certificate_number)


@router.post(
    "/public/certificates/{verification_token}/report-discrepancy",
    response_model=DiscrepancyReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Public Whistleblower / Anti-Tamper Report",
)
def report_certificate_discrepancy(
    verification_token: str,
    report: DiscrepancyReportSubmit,
    db: Session = Depends(get_db),
) -> DiscrepancyReportResponse:
    """Unauthenticated whistleblower endpoint for citizens to report tampered or suspicious certificates."""
    # Get the raw Certificate model (not the Pydantic response) for the FK
    cert = certificate_repository.get_by_verification_token(db, verification_token)
    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification token not found in registry.",
        )

    # Generate reference ID
    date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    rand_suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    ref_id = f"REP-{date_str}-{rand_suffix}"

    # Persist the report to the database
    db_report = DiscrepancyReport(
        report_reference_id=ref_id,
        certificate_id=cert.id,
        discrepancy_type=report.discrepancy_type,
        description=report.description,
        reporter_name=report.reporter_name,
        reporter_phone=report.reporter_phone,
        evidence_image_url=report.evidence_image_url,
        status="PENDING",
    )
    discrepancy_report_repository.create(db, db_report)

    # Notify Legal Metrology Officers
    officers = user_repository.list_by_roles(db, [UserRole.LMO, UserRole.ADMIN])
    for officer in officers:
        notification_service.send_notification(
            db,
            user_id=officer.id,
            type=NotificationType.CERTIFICATE_ISSUED,
            title="⚠️ Anti-Tamper Discrepancy Report",
            message=(
                f"Citizen report filed for Cert {cert.certificate_number} "
                f"[{report.discrepancy_type}]: {report.description[:100]}... "
                f"(Ref: {ref_id})"
            ),
            entity_type="CERTIFICATE",
            entity_id=None,
        )

    db.commit()

    return DiscrepancyReportResponse(
        report_reference_id=ref_id,
        status="RECEIVED",
        message="Thank you for your report. The Legal Metrology Department has been alerted for statutory scrutiny.",
    )


# ── Discrepancy Reports Management (LMO / Admin) ───────────────


def _enrich_report(report: DiscrepancyReport) -> DiscrepancyReportDetailResponse:
    """Convert DB model to response schema with joined fields."""
    return DiscrepancyReportDetailResponse(
        id=report.id,
        report_reference_id=report.report_reference_id,
        certificate_id=report.certificate_id,
        certificate_number=(
            report.certificate.certificate_number
            if report.certificate else None
        ),
        discrepancy_type=report.discrepancy_type,
        description=report.description,
        reporter_name=report.reporter_name,
        reporter_phone=report.reporter_phone,
        evidence_image_url=report.evidence_image_url,
        status=report.status,
        reviewed_by_id=report.reviewed_by_id,
        reviewed_by_name=(
            report.reviewed_by.full_name
            if report.reviewed_by else None
        ),
        action_remarks=report.action_remarks,
        reviewed_at=report.reviewed_at,
        created_at=report.created_at,
        updated_at=report.updated_at,
    )


@router.get(
    "/discrepancy-reports",
    response_model=DiscrepancyReportListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Discrepancy Reports (LMO / Admin)",
)
def list_discrepancy_reports(
    status_filter: Optional[str] = Query(
        None, alias="status",
        description="Filter: PENDING, UNDER_REVIEW, RESOLVED, DISMISSED",
    ),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.LMO, UserRole.ADMIN)
    ),
) -> DiscrepancyReportListResponse:
    """Retrieve paginated list of citizen discrepancy reports."""
    items, total = discrepancy_report_repository.list_reports(
        db, status_filter=status_filter, page=page, page_size=page_size,
    )
    return DiscrepancyReportListResponse(
        items=[_enrich_report(r) for r in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.patch(
    "/discrepancy-reports/{report_id}/action",
    response_model=DiscrepancyReportDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Take Action on Discrepancy Report (LMO / Admin)",
)
def action_discrepancy_report(
    report_id: int,
    action: DiscrepancyReportActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.LMO, UserRole.ADMIN)
    ),
) -> DiscrepancyReportDetailResponse:
    """LMO / Admin reviews and takes action on a discrepancy report."""
    report = discrepancy_report_repository.get_by_id(db, report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Discrepancy report {report_id} not found.",
        )

    valid_statuses = {"UNDER_REVIEW", "RESOLVED", "DISMISSED"}
    if action.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status must be one of: {', '.join(valid_statuses)}",
        )

    report.status = action.status
    report.action_remarks = action.action_remarks
    report.reviewed_by_id = current_user.id
    report.reviewed_at = datetime.now(timezone.utc)
    db.flush()
    db.commit()
    db.refresh(report)

    return _enrich_report(report)
