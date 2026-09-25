from __future__ import annotations
import calendar
from datetime import date, datetime, timezone
import secrets
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.certificate import Certificate
from app.models.enums import ApplicationStatus, CertificateStatus, NotificationType, UserRole, get_validity_months
from app.models.user import User
from app.repositories.application_repository import application_repository
from app.repositories.certificate_repository import certificate_repository
from app.schemas.certificate import (
    CertificateDetailResponse,
    CertificateListResponse,
    PublicCertificateVerificationResponse,
)
from app.services.certificate_hasher import compute_integrity_hash, generate_canonical_payload
from app.services.notification_service import notification_service
from app.services.pdf_service import pdf_service


class CertificateService:
    """Service managing certificate lifecycle, SHA-256 digests, and PDF generation."""

    def generate_canonical_payload(self, **kwargs) -> str:
        """Create a deterministic canonical JSON string for SHA-256 integrity calculation."""
        return generate_canonical_payload(**kwargs)

    def calculate_integrity_hash(self, canonical_payload: str) -> str:
        """Compute SHA-256 digest of canonical certificate data."""
        return compute_integrity_hash(canonical_payload)

    def generate_certificate_number(self, db: Session) -> str:
        """Generate a human-readable unique certificate number (METRIX-CERT-YYYY-000001)."""
        year = datetime.now(timezone.utc).year
        total_certs = certificate_repository.count_total(db)
        seq = total_certs + 1
        for attempt in range(20):
            cert_num = f"METRIX-CERT-{year}-{(seq + attempt):06d}"
            if not certificate_repository.get_by_certificate_number(db, cert_num):
                return cert_num
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to generate a unique certificate number.",
        )

    def generate_verification_token(self) -> str:
        """Generate a cryptographically secure, unpredictable URL-safe verification token."""
        return secrets.token_urlsafe(32)

    def _get_effective_status(self, cert: Certificate) -> CertificateStatus:
        """Evaluate certificate status dynamically based on current date vs valid_until."""
        today = date.today()
        if today > cert.valid_until:
            return CertificateStatus.EXPIRED
        return cert.status

    def _to_detail_response(self, cert: Certificate) -> CertificateDetailResponse:
        inst = cert.instrument
        app = cert.application
        issuer = cert.issued_by
        effective_status = self._get_effective_status(cert)
        verification_url = f"{settings.PUBLIC_VERIFICATION_BASE_URL}/{cert.verification_token}"

        return CertificateDetailResponse(
            id=cert.id,
            certificate_number=cert.certificate_number,
            application_id=cert.application_id,
            instrument_id=cert.instrument_id,
            issued_by_id=cert.issued_by_id,
            issued_at=cert.issued_at,
            valid_from=cert.valid_from,
            valid_until=cert.valid_until,
            status=effective_status,
            integrity_hash=cert.integrity_hash,
            verification_token=cert.verification_token,
            pdf_path=cert.pdf_path,
            created_at=cert.created_at,
            updated_at=cert.updated_at,
            instrument_registration_number=inst.registration_number if inst else None,
            instrument_type=inst.instrument_type.value if inst else None,
            manufacturer=inst.manufacturer if inst else None,
            model_name=inst.model_name if inst else None,
            serial_number=inst.serial_number if inst else None,
            capacity=inst.capacity if inst else None,
            issued_by_name=issuer.full_name if issuer else None,
            application_number=app.application_number if app else None,
            verification_url=verification_url,
        )

    def issue_certificate(
        self,
        db: Session,
        *,
        application_id: int,
        current_user: User,
        remarks: Optional[str] = None,
    ) -> CertificateDetailResponse:
        """Issue an official digital certificate for a VERIFIED application."""
        # 1. RBAC: Only LMO or ADMIN can issue certificates
        if current_user.role not in [UserRole.LMO, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Legal Metrology Officers or Administrators can issue certificates.",
            )

        # 2. Check application exists
        application = application_repository.get_by_id_with_history(db, application_id)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application with id {application_id} not found.",
            )

        # 3. Prevent duplicate certificate issuance
        existing_cert = certificate_repository.get_by_application_id(db, application_id)
        if existing_cert:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A certificate has already been issued for this application.",
            )

        # 4. Application must be VERIFIED
        if application.status != ApplicationStatus.VERIFIED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Cannot issue certificate for application in '{application.status.value}' status. "
                    "Application must be 'VERIFIED'."
                ),
            )

        instrument = application.instrument
        if not instrument:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Associated instrument record not found for this application.",
            )

        # 5. Calculate validity (dynamic per instrument type, Rule 13)
        now = datetime.now(timezone.utc)
        valid_from = now.date()
        validity_months = get_validity_months(instrument.instrument_type)
        m = valid_from.month - 1 + validity_months
        y = valid_from.year + m // 12
        m = m % 12 + 1
        d = min(valid_from.day, calendar.monthrange(y, m)[1])
        valid_until = date(y, m, d)
        certificate_number = self.generate_certificate_number(db)
        verification_token = self.generate_verification_token()

        owner = instrument.owner
        owner_name = (
            owner.profile.business_name
            if (owner and owner.profile and owner.profile.business_name)
            else (owner.full_name if owner else "Authorized Owner")
        )

        # Identify inspecting officer from the inspection record
        inspection = application.inspection
        inspecting_officer = (
            inspection.assigned_to if inspection else None
        )
        inspecting_officer_name = (
            inspecting_officer.full_name
            if inspecting_officer else "Legal Metrology Officer"
        )
        issuing_officer_name = current_user.full_name

        # 6. Generate canonical payload and SHA-256 integrity hash
        canonical_str = self.generate_canonical_payload(
            certificate_number=certificate_number,
            application_number=application.application_number,
            instrument_registration_number=instrument.registration_number,
            instrument_serial_number=instrument.serial_number,
            instrument_type=instrument.instrument_type.value,
            owner_identifier=owner_name,
            inspection_result="VERIFIED",
            issued_at=now.isoformat(),
            valid_from=valid_from.isoformat(),
            valid_until=valid_until.isoformat(),
            verification_token=verification_token,
        )
        integrity_hash = self.calculate_integrity_hash(canonical_str)

        # 7. Generate PDF with embedded QR code and officer names
        try:
            pdf_path = pdf_service.generate_certificate_pdf(
                certificate_number=certificate_number,
                application_number=application.application_number,
                instrument_registration_number=instrument.registration_number,
                instrument_type=instrument.instrument_type.value,
                manufacturer=instrument.manufacturer,
                model_name=instrument.model_name,
                serial_number=instrument.serial_number,
                capacity=instrument.capacity or "N/A",
                location=instrument.location,
                owner_name=owner_name,
                issued_at=now.strftime("%Y-%m-%d %H:%M:%S UTC"),
                valid_from=valid_from.strftime("%Y-%m-%d"),
                valid_until=valid_until.strftime("%Y-%m-%d"),
                integrity_hash=integrity_hash,
                verification_token=verification_token,
                inspecting_officer_name=inspecting_officer_name,
                issuing_officer_name=issuing_officer_name,
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate certificate PDF document: {str(e)}",
            )

        # 8. Persist Certificate entity
        cert = certificate_repository.create(
            db,
            certificate_number=certificate_number,
            application_id=application.id,
            instrument_id=instrument.id,
            issued_by_id=current_user.id,
            issued_at=now,
            valid_from=valid_from,
            valid_until=valid_until,
            status=CertificateStatus.ACTIVE,
            integrity_hash=integrity_hash,
            verification_token=verification_token,
            pdf_path=pdf_path,
        )

        # 9. Advance application status to CERTIFICATE_ISSUED and update history
        application.status = ApplicationStatus.CERTIFICATE_ISSUED
        application_repository.add_status_history(
            db,
            application_id=application.id,
            from_status=ApplicationStatus.VERIFIED,
            to_status=ApplicationStatus.CERTIFICATE_ISSUED,
            changed_by_id=current_user.id,
            remarks=remarks or f"Digital Certificate issued: {certificate_number}",
        )

        notification_service.send_notification(
            db,
            user_id=application.applicant_id,
            type=NotificationType.CERTIFICATE_ISSUED,
            title="Digital Certificate Issued",
            message=f"Digital verification certificate {certificate_number} has been issued for instrument '{instrument.registration_number}'.",
            entity_type="CERTIFICATE",
            entity_id=cert.id,
        )

        db.commit()
        refreshed_cert = certificate_repository.get_by_id_with_relations(db, cert.id)
        return self._to_detail_response(refreshed_cert)

    def _verify_certificate_access(self, cert: Certificate, current_user: User) -> None:
        """Validate that current user has authorized access to the certificate."""
        if current_user.role == UserRole.INSTRUMENT_OWNER:
            if cert.instrument.owner_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to access this certificate.",
                )
        elif current_user.role == UserRole.GATC:
            insp = cert.application.inspection if cert.application else None
            if not insp or insp.assigned_to_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to access this certificate.",
                )

    def get_certificate(
        self, db: Session, *, certificate_id: int, current_user: User
    ) -> CertificateDetailResponse:
        """Retrieve certificate details for authorized users."""
        cert = certificate_repository.get_by_id_with_relations(db, certificate_id)
        if not cert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Certificate with id {certificate_id} not found.",
            )

        self._verify_certificate_access(cert, current_user)
        return self._to_detail_response(cert)

    def get_certificate_by_application(
        self, db: Session, *, application_id: int, current_user: User
    ) -> CertificateDetailResponse:
        """Retrieve certificate associated with a given application."""
        application = application_repository.get_by_id(db, application_id)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application with id {application_id} not found.",
            )

        if current_user.role == UserRole.INSTRUMENT_OWNER and application.applicant_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this certificate.",
            )
        elif current_user.role == UserRole.GATC:
            insp = application.inspection
            if not insp or insp.assigned_to_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to view this certificate.",
                )

        cert = certificate_repository.get_by_application_id(db, application_id)
        if not cert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No certificate found for application {application_id}.",
            )

        return self._to_detail_response(cert)

    def verify_public_token(
        self, db: Session, *, token: str
    ) -> PublicCertificateVerificationResponse:
        """Verify certificate by public verification token without authentication."""
        cert = certificate_repository.get_by_verification_token(db, token)
        if not cert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Verification certificate not found for the provided QR token.",
            )

        effective_status = self._get_effective_status(cert)
        inst = cert.instrument

        return PublicCertificateVerificationResponse(
            certificate_number=cert.certificate_number,
            instrument_registration_number=inst.registration_number if inst else "N/A",
            instrument_type=inst.instrument_type.value if inst else "N/A",
            manufacturer=inst.manufacturer if inst else "N/A",
            model=inst.model_name if inst else "N/A",
            serial_number=inst.serial_number if inst else None,
            verification_result="VERIFIED",
            issued_at=cert.issued_at,
            valid_from=cert.valid_from,
            valid_until=cert.valid_until,
            status=effective_status,
            integrity_hash=cert.integrity_hash,
        )

    def verify_by_certificate_number(
        self, db: Session, *, certificate_number: str
    ) -> PublicCertificateVerificationResponse:
        """Verify certificate by its certificate number (public lookup)."""
        cert = certificate_repository.get_by_certificate_number(db, certificate_number)
        if not cert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No certificate found matching the provided certificate number.",
            )

        effective_status = self._get_effective_status(cert)
        inst = cert.instrument

        return PublicCertificateVerificationResponse(
            certificate_number=cert.certificate_number,
            instrument_registration_number=inst.registration_number if inst else "N/A",
            instrument_type=inst.instrument_type.value if inst else "N/A",
            manufacturer=inst.manufacturer if inst else "N/A",
            model=inst.model_name if inst else "N/A",
            serial_number=inst.serial_number if inst else None,
            verification_result="VERIFIED",
            issued_at=cert.issued_at,
            valid_from=cert.valid_from,
            valid_until=cert.valid_until,
            status=effective_status,
            integrity_hash=cert.integrity_hash,
        )

    def download_certificate(
        self, db: Session, *, certificate_id: int, current_user: User
    ) -> tuple[bytes, str]:
        """Verify access and return PDF bytes along with the filename for download."""
        cert = certificate_repository.get_by_id_with_relations(db, certificate_id)
        if not cert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Certificate with id {certificate_id} not found.",
            )

        self._verify_certificate_access(cert, current_user)

        if not cert.pdf_path or not pdf_service.storage_dir.joinpath(f"{cert.certificate_number}.pdf").exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Certificate PDF file is missing or has been deleted.",
            )

        pdf_bytes = pdf_service.get_pdf_bytes(cert.pdf_path)
        filename = f"{cert.certificate_number}.pdf"
        return pdf_bytes, filename

    def search_certificates(
        self,
        db: Session,
        *,
        current_user: User,
        certificate_number: Optional[str] = None,
        instrument_id: Optional[int] = None,
        instrument_registration_number: Optional[str] = None,
        status: Optional[CertificateStatus] = None,
        issue_date_from: Optional[date] = None,
        issue_date_to: Optional[date] = None,
        expiry_date_from: Optional[date] = None,
        expiry_date_to: Optional[date] = None,
        owner_id: Optional[int] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> CertificateListResponse:
        """Search and filter certificates respecting ownership boundaries."""
        skip = max(0, (page - 1) * page_size)
        effective_owner_id = (
            current_user.id
            if current_user.role == UserRole.INSTRUMENT_OWNER
            else owner_id
        )

        items, total = certificate_repository.search(
            db,
            owner_id=effective_owner_id,
            certificate_number=certificate_number,
            instrument_id=instrument_id,
            instrument_registration_number=instrument_registration_number,
            status=status,
            issue_date_from=issue_date_from,
            issue_date_to=issue_date_to,
            expiry_date_from=expiry_date_from,
            expiry_date_to=expiry_date_to,
            skip=skip,
            limit=page_size,
        )

        return CertificateListResponse(
            items=[self._to_detail_response(item) for item in items],
            total=total,
            page=page,
            page_size=page_size,
        )

    def list_expiring_certificates(
        self,
        db: Session,
        *,
        current_user: User,
        page: int = 1,
        page_size: int = 20,
    ) -> CertificateListResponse:
        """List active certificates entering warning period."""
        skip = max(0, (page - 1) * page_size)
        owner_id = current_user.id if current_user.role == UserRole.INSTRUMENT_OWNER else None
        items, total = certificate_repository.list_expiring(
            db,
            owner_id=owner_id,
            warning_days=settings.CERTIFICATE_EXPIRY_WARNING_DAYS,
            skip=skip,
            limit=page_size,
        )
        return CertificateListResponse(
            items=[self._to_detail_response(item) for item in items],
            total=total,
            page=page,
            page_size=page_size,
        )

    def list_expired_certificates(
        self,
        db: Session,
        *,
        current_user: User,
        page: int = 1,
        page_size: int = 20,
    ) -> CertificateListResponse:
        """List expired certificates respecting ownership boundaries."""
        skip = max(0, (page - 1) * page_size)
        owner_id = current_user.id if current_user.role == UserRole.INSTRUMENT_OWNER else None
        items, total = certificate_repository.list_expired(
            db,
            owner_id=owner_id,
            skip=skip,
            limit=page_size,
        )
        return CertificateListResponse(
            items=[self._to_detail_response(item) for item in items],
            total=total,
            page=page,
            page_size=page_size,
        )


certificate_service = CertificateService()
