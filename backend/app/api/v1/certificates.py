from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, get_db
from app.models.enums import CertificateStatus
from app.models.user import User
from app.schemas.certificate import (
    CertificateDetailResponse,
    CertificateListResponse,
    PublicCertificateVerificationResponse,
)
from app.services.certificate_service import certificate_service

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
