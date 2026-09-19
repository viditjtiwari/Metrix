from __future__ import annotations
from datetime import date, datetime, timedelta, timezone
import hashlib
import json
import secrets
from typing import Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.certificate import Certificate
from app.models.enums import ApplicationStatus, CertificateStatus, UserRole
from app.models.user import User
from app.repositories.application_repository import application_repository
from app.repositories.certificate_repository import certificate_repository
from app.schemas.certificate import (
    CertificateDetailResponse,
    CertificateResponse,
    PublicCertificateVerificationResponse,
)
from app.services.pdf_service import pdf_service


class CertificateService:
    """Service managing the legal metrology certificate lifecycle, SHA-256 integrity digests,

    PDF generation with embedded QR tokens, and public verification.
    """

    def generate_canonical_payload(
        self,
        *,
        certificate_number: str,
        application_number: str,
        instrument_registration_number: str,
        instrument_serial_number: str,
        instrument_type: str,
        owner_identifier: str,
        inspection_result: str,
        issued_at: datetime | str,
        valid_from: date | str,
        valid_until: date | str,
        verification_token: str,
    ) -> str:
        """Create a deterministic canonical JSON string for SHA-256 integrity calculation."""
        if isinstance(issued_at, datetime):
            issued_str = issued_at.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        elif isinstance(issued_at, str):
            try:
                dt = datetime.fromisoformat(issued_at.replace("Z", "+00:00"))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                issued_str = dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
            except Exception:
                issued_str = issued_at
        else:
            issued_str = str(issued_at)

        v_from_str = valid_from.isoformat() if hasattr(valid_from, "isoformat") else str(valid_from)
        v_until_str = valid_until.isoformat() if hasattr(valid_until, "isoformat") else str(valid_until)

        payload = {
            "application_number": application_number,
            "certificate_number": certificate_number,
            "inspection_result": inspection_result,
            "instrument_registration_number": instrument_registration_number,
            "instrument_serial_number": instrument_serial_number,
            "instrument_type": instrument_type,
            "issued_at": issued_str,
            "owner_identifier": owner_identifier,
            "valid_from": v_from_str,
            "valid_until": v_until_str,
            "verification_token": verification_token,
        }
        return json.dumps(payload, sort_keys=True, separators=(",", ":"))

    def calculate_integrity_hash(self, canonical_payload: str) -> str:
        """Compute SHA-256 digest of canonical certificate data."""
        return hashlib.sha256(canonical_payload.encode("utf-8")).hexdigest()

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

        # 5. Calculate validity and identifiers
        now = datetime.now(timezone.utc)
        valid_from = now.date()
        valid_until = valid_from + timedelta(days=settings.CERTIFICATE_VALIDITY_DAYS)
        certificate_number = self.generate_certificate_number(db)
        verification_token = self.generate_verification_token()

        owner = instrument.owner
        owner_name = (
            owner.profile.business_name
            if (owner and owner.profile and owner.profile.business_name)
            else (owner.full_name if owner else "Authorized Owner")
        )

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

        # 7. Generate PDF with embedded QR code
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

        db.commit()
        refreshed_cert = certificate_repository.get_by_id_with_relations(db, cert.id)
        return self._to_detail_response(refreshed_cert)

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

        if current_user.role == UserRole.INSTRUMENT_OWNER:
            if cert.instrument.owner_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to view this certificate.",
                )

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

        if current_user.role == UserRole.INSTRUMENT_OWNER:
            if cert.instrument.owner_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to download this certificate.",
                )

        if not cert.pdf_path or not pdf_service.storage_dir.joinpath(f"{cert.certificate_number}.pdf").exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Certificate PDF file is missing or has been deleted.",
            )

        pdf_bytes = pdf_service.get_pdf_bytes(cert.pdf_path)
        filename = f"{cert.certificate_number}.pdf"
        return pdf_bytes, filename


certificate_service = CertificateService()
