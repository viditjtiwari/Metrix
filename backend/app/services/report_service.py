import csv
import io
from datetime import date, datetime
from typing import Optional
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload
from app.core.config import settings
from app.models.application import VerificationApplication
from app.models.certificate import Certificate
from app.models.enums import CertificateStatus, UserRole
from app.models.inspection import Inspection
from app.models.instrument import Instrument
from app.models.user import User


class ReportService:
    """Service providing operational CSV report generation with strict RBAC enforcement."""

    def generate_applications_report(
        self,
        db: Session,
        *,
        current_user: User,
        status: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
    ) -> str:
        stmt = (
            select(VerificationApplication)
            .options(
                selectinload(VerificationApplication.instrument),
                selectinload(VerificationApplication.applicant),
            )
            .order_by(VerificationApplication.created_at.desc())
        )

        if current_user.role == UserRole.INSTRUMENT_OWNER:
            stmt = stmt.where(VerificationApplication.applicant_id == current_user.id)
        if status:
            stmt = stmt.where(VerificationApplication.status == status)
        if date_from:
            stmt = stmt.where(VerificationApplication.created_at >= datetime.combine(date_from, datetime.min.time()))
        if date_to:
            stmt = stmt.where(VerificationApplication.created_at <= datetime.combine(date_to, datetime.max.time()))

        apps = db.execute(stmt).scalars().all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Application Number",
            "Instrument Registration Number",
            "Instrument Type",
            "Applicant Name",
            "Applicant Email",
            "Application Type",
            "Status",
            "Submitted At",
            "Created At",
        ])

        for app in apps:
            inst = app.instrument
            user = app.applicant
            writer.writerow([
                app.application_number,
                inst.registration_number if inst else "",
                inst.instrument_type.value if inst else "",
                user.full_name if user else "",
                user.email if user else "",
                app.application_type,
                app.status.value,
                app.submitted_at.strftime("%Y-%m-%d %H:%M:%S") if app.submitted_at else "",
                app.created_at.strftime("%Y-%m-%d %H:%M:%S") if app.created_at else "",
            ])

        return output.getvalue()

    def generate_instruments_report(
        self,
        db: Session,
        *,
        current_user: User,
    ) -> str:
        stmt = (
            select(Instrument)
            .options(selectinload(Instrument.owner))
            .order_by(Instrument.created_at.desc())
        )

        if current_user.role == UserRole.INSTRUMENT_OWNER:
            stmt = stmt.where(Instrument.owner_id == current_user.id)

        instruments = db.execute(stmt).scalars().all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Registration Number",
            "Owner Name",
            "Owner Email",
            "Instrument Type",
            "Manufacturer",
            "Model Name",
            "Serial Number",
            "Capacity",
            "Location",
            "Is Active",
            "Created At",
        ])

        for inst in instruments:
            owner = inst.owner
            writer.writerow([
                inst.registration_number,
                owner.full_name if owner else "",
                owner.email if owner else "",
                inst.instrument_type.value,
                inst.manufacturer,
                inst.model_name,
                inst.serial_number,
                inst.capacity or "",
                inst.location,
                "YES" if inst.is_active else "NO",
                inst.created_at.strftime("%Y-%m-%d %H:%M:%S") if inst.created_at else "",
            ])

        return output.getvalue()

    def generate_verifications_report(
        self,
        db: Session,
        *,
        current_user: User,
    ) -> str:
        stmt = (
            select(Inspection)
            .options(
                selectinload(Inspection.application).selectinload(VerificationApplication.instrument),
                selectinload(Inspection.assigned_to),
            )
            .order_by(Inspection.created_at.desc())
        )

        if current_user.role == UserRole.INSTRUMENT_OWNER:
            stmt = stmt.join(VerificationApplication, Inspection.application_id == VerificationApplication.id).where(
                VerificationApplication.applicant_id == current_user.id
            )
        elif current_user.role == UserRole.GATC:
            stmt = stmt.where(Inspection.assigned_to_id == current_user.id)

        inspections = db.execute(stmt).scalars().all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Inspection ID",
            "Application Number",
            "Instrument Registration Number",
            "Assigned Verifier",
            "Verifier Role",
            "Scheduled Date",
            "Scheduled Time",
            "Inspection Location",
            "Started At",
            "Completed At",
            "Result",
            "Result Remarks",
        ])

        for insp in inspections:
            app = insp.application
            inst = app.instrument if app else None
            verifier = insp.assigned_to
            writer.writerow([
                insp.id,
                app.application_number if app else "",
                inst.registration_number if inst else "",
                verifier.full_name if verifier else "Unassigned",
                verifier.role.value if verifier else "",
                insp.scheduled_date.strftime("%Y-%m-%d") if insp.scheduled_date else "",
                insp.scheduled_time or "",
                insp.inspection_location or "",
                insp.started_at.strftime("%Y-%m-%d %H:%M:%S") if insp.started_at else "",
                insp.completed_at.strftime("%Y-%m-%d %H:%M:%S") if insp.completed_at else "",
                insp.result.value if insp.result else "PENDING",
                insp.result_remarks or "",
            ])

        return output.getvalue()

    def generate_certificates_report(
        self,
        db: Session,
        *,
        current_user: User,
    ) -> str:
        stmt = (
            select(Certificate)
            .options(
                selectinload(Certificate.application),
                selectinload(Certificate.instrument).selectinload(Instrument.owner),
                selectinload(Certificate.issued_by),
            )
            .order_by(Certificate.issued_at.desc())
        )

        if current_user.role == UserRole.INSTRUMENT_OWNER:
            stmt = stmt.join(Instrument, Certificate.instrument_id == Instrument.id).where(
                Instrument.owner_id == current_user.id
            )

        certs = db.execute(stmt).scalars().all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Certificate Number",
            "Application Number",
            "Instrument Registration Number",
            "Owner Name",
            "Issued By",
            "Issued At",
            "Valid From",
            "Valid Until",
            "Status",
            "Integrity Digest",
        ])

        for cert in certs:
            app = cert.application
            inst = cert.instrument
            owner = inst.owner if inst else None
            issuer = cert.issued_by
            effective_status = (
                CertificateStatus.EXPIRED
                if date.today() > cert.valid_until
                else cert.status
            )
            writer.writerow([
                cert.certificate_number,
                app.application_number if app else "",
                inst.registration_number if inst else "",
                owner.full_name if owner else "",
                issuer.full_name if issuer else "",
                cert.issued_at.strftime("%Y-%m-%d %H:%M:%S") if cert.issued_at else "",
                cert.valid_from.strftime("%Y-%m-%d"),
                cert.valid_until.strftime("%Y-%m-%d"),
                effective_status.value,
                cert.integrity_hash,
            ])

        return output.getvalue()

    def generate_expiry_report(
        self,
        db: Session,
        *,
        current_user: User,
    ) -> str:
        today = date.today()
        warning_date = today + settings.CERTIFICATE_EXPIRY_WARNING_DAYS * \
            (date.fromordinal(today.toordinal() + 1) - today)

        stmt = (
            select(Certificate)
            .options(
                selectinload(Certificate.instrument).selectinload(Instrument.owner),
            )
            .where(
                or_(
                    Certificate.valid_until <= warning_date,
                    Certificate.status == CertificateStatus.EXPIRED,
                )
            )
            .order_by(Certificate.valid_until.asc())
        )

        if current_user.role == UserRole.INSTRUMENT_OWNER:
            stmt = stmt.join(Instrument, Certificate.instrument_id == Instrument.id).where(
                Instrument.owner_id == current_user.id
            )

        certs = db.execute(stmt).scalars().all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Certificate Number",
            "Instrument Registration Number",
            "Owner Name",
            "Valid From",
            "Valid Until",
            "Status",
            "Condition",
            "Days Remaining",
        ])

        for cert in certs:
            inst = cert.instrument
            owner = inst.owner if inst else None
            days_left = (cert.valid_until - today).days
            if days_left < 0:
                condition = "EXPIRED"
                status_str = "EXPIRED"
            else:
                condition = "EXPIRING_SOON"
                status_str = "ACTIVE"

            writer.writerow([
                cert.certificate_number,
                inst.registration_number if inst else "",
                owner.full_name if owner else "",
                cert.valid_from.strftime("%Y-%m-%d"),
                cert.valid_until.strftime("%Y-%m-%d"),
                status_str,
                condition,
                days_left,
            ])

        return output.getvalue()


report_service = ReportService()
