from datetime import date, timedelta
from typing import Any, Dict
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session
from app.models.application import VerificationApplication
from app.models.certificate import Certificate
from app.models.enums import ApplicationStatus, CertificateStatus, UserRole
from app.models.inspection import Inspection
from app.models.instrument import Instrument
from app.models.user import User


class DashboardRepository:
    """Repository executing fast SQL database aggregations for role-aware dashboards."""

    def get_owner_metrics(self, db: Session, *, owner_id: int) -> Dict[str, Any]:
        today = date.today()

        total_instruments = db.execute(
            select(func.count(Instrument.id)).where(Instrument.owner_id == owner_id)
        ).scalar_one()

        total_applications = db.execute(
            select(func.count(VerificationApplication.id)).where(
                VerificationApplication.applicant_id == owner_id
            )
        ).scalar_one()

        pending_applications = db.execute(
            select(func.count(VerificationApplication.id)).where(
                VerificationApplication.applicant_id == owner_id,
                VerificationApplication.status.in_([
                    ApplicationStatus.SUBMITTED,
                    ApplicationStatus.UNDER_REVIEW,
                    ApplicationStatus.SCHEDULED,
                    ApplicationStatus.INSPECTION_IN_PROGRESS,
                    ApplicationStatus.INSPECTION_COMPLETED,
                ]),
            )
        ).scalar_one()

        scheduled_inspections = db.execute(
            select(func.count(VerificationApplication.id)).where(
                VerificationApplication.applicant_id == owner_id,
                VerificationApplication.status == ApplicationStatus.SCHEDULED,
            )
        ).scalar_one()

        verified_applications = db.execute(
            select(func.count(VerificationApplication.id)).where(
                VerificationApplication.applicant_id == owner_id,
                VerificationApplication.status.in_([
                    ApplicationStatus.VERIFIED,
                    ApplicationStatus.CERTIFICATE_ISSUED,
                ]),
            )
        ).scalar_one()

        rejected_applications = db.execute(
            select(func.count(VerificationApplication.id)).where(
                VerificationApplication.applicant_id == owner_id,
                VerificationApplication.status == ApplicationStatus.REJECTED,
            )
        ).scalar_one()

        # Certificates belonging to this owner's instruments
        active_certificates = db.execute(
            select(func.count(Certificate.id))
            .join(Instrument, Certificate.instrument_id == Instrument.id)
            .where(
                Instrument.owner_id == owner_id,
                Certificate.status == CertificateStatus.ACTIVE,
                Certificate.valid_until >= today,
            )
        ).scalar_one()

        expired_certificates = db.execute(
            select(func.count(Certificate.id))
            .join(Instrument, Certificate.instrument_id == Instrument.id)
            .where(
                Instrument.owner_id == owner_id,
                or_(
                    Certificate.status == CertificateStatus.EXPIRED,
                    Certificate.valid_until < today,
                ),
            )
        ).scalar_one()

        return {
            "total_instruments": total_instruments,
            "total_applications": total_applications,
            "pending_applications": pending_applications,
            "scheduled_inspections": scheduled_inspections,
            "verified_applications": verified_applications,
            "rejected_applications": rejected_applications,
            "active_certificates": active_certificates,
            "expired_certificates": expired_certificates,
        }

    def get_lmo_metrics(
        self, db: Session, *, warning_days: int = 30
    ) -> Dict[str, Any]:
        today = date.today()
        warning_date = today + timedelta(days=warning_days)

        applications_pending_review = db.execute(
            select(func.count(VerificationApplication.id)).where(
                VerificationApplication.status.in_([
                    ApplicationStatus.SUBMITTED,
                    ApplicationStatus.UNDER_REVIEW,
                ])
            )
        ).scalar_one()

        scheduled_inspections = db.execute(
            select(func.count(VerificationApplication.id)).where(
                VerificationApplication.status == ApplicationStatus.SCHEDULED
            )
        ).scalar_one()

        inspections_in_progress = db.execute(
            select(func.count(VerificationApplication.id)).where(
                VerificationApplication.status == ApplicationStatus.INSPECTION_IN_PROGRESS
            )
        ).scalar_one()

        completed_inspections = db.execute(
            select(func.count(VerificationApplication.id)).where(
                VerificationApplication.status.in_([
                    ApplicationStatus.INSPECTION_COMPLETED,
                    ApplicationStatus.VERIFIED,
                    ApplicationStatus.CERTIFICATE_ISSUED,
                    ApplicationStatus.REJECTED,
                ])
            )
        ).scalar_one()

        verified_applications = db.execute(
            select(func.count(VerificationApplication.id)).where(
                VerificationApplication.status.in_([
                    ApplicationStatus.VERIFIED,
                    ApplicationStatus.CERTIFICATE_ISSUED,
                ])
            )
        ).scalar_one()

        rejected_applications = db.execute(
            select(func.count(VerificationApplication.id)).where(
                VerificationApplication.status == ApplicationStatus.REJECTED
            )
        ).scalar_one()

        certificates_issued = db.execute(
            select(func.count(Certificate.id))
        ).scalar_one()

        certificates_expiring = db.execute(
            select(func.count(Certificate.id)).where(
                Certificate.status == CertificateStatus.ACTIVE,
                Certificate.valid_until >= today,
                Certificate.valid_until <= warning_date,
            )
        ).scalar_one()

        return {
            "applications_pending_review": applications_pending_review,
            "scheduled_inspections": scheduled_inspections,
            "inspections_in_progress": inspections_in_progress,
            "completed_inspections": completed_inspections,
            "verified_applications": verified_applications,
            "rejected_applications": rejected_applications,
            "certificates_issued": certificates_issued,
            "certificates_expiring": certificates_expiring,
        }

    def get_gatc_metrics(self, db: Session, *, user_id: int) -> Dict[str, Any]:
        assigned_inspections = db.execute(
            select(func.count(Inspection.id)).where(
                Inspection.assigned_to_id == user_id
            )
        ).scalar_one()

        scheduled_inspections = db.execute(
            select(func.count(Inspection.id))
            .join(VerificationApplication, Inspection.application_id == VerificationApplication.id)
            .where(
                Inspection.assigned_to_id == user_id,
                VerificationApplication.status == ApplicationStatus.SCHEDULED,
            )
        ).scalar_one()

        inspections_in_progress = db.execute(
            select(func.count(Inspection.id))
            .join(VerificationApplication, Inspection.application_id == VerificationApplication.id)
            .where(
                Inspection.assigned_to_id == user_id,
                VerificationApplication.status == ApplicationStatus.INSPECTION_IN_PROGRESS,
            )
        ).scalar_one()

        completed_inspections = db.execute(
            select(func.count(Inspection.id))
            .join(VerificationApplication, Inspection.application_id == VerificationApplication.id)
            .where(
                Inspection.assigned_to_id == user_id,
                or_(
                    Inspection.completed_at.isnot(None),
                    VerificationApplication.status.in_([
                        ApplicationStatus.INSPECTION_COMPLETED,
                        ApplicationStatus.VERIFIED,
                        ApplicationStatus.CERTIFICATE_ISSUED,
                        ApplicationStatus.REJECTED,
                    ]),
                ),
            )
        ).scalar_one()

        verification_results = db.execute(
            select(func.count(Inspection.id)).where(
                Inspection.assigned_to_id == user_id,
                Inspection.result.isnot(None),
            )
        ).scalar_one()

        return {
            "assigned_inspections": assigned_inspections,
            "scheduled_inspections": scheduled_inspections,
            "inspections_in_progress": inspections_in_progress,
            "completed_inspections": completed_inspections,
            "verification_results": verification_results,
        }

    def get_admin_metrics(
        self, db: Session, *, warning_days: int = 30
    ) -> Dict[str, Any]:
        today = date.today()
        warning_date = today + timedelta(days=warning_days)

        total_users = db.execute(select(func.count(User.id))).scalar_one()

        users_by_role_rows = db.execute(
            select(User.role, func.count(User.id)).group_by(User.role)
        ).all()
        users_by_role = {
            (r.value if hasattr(r, "value") else str(r)): count
            for r, count in users_by_role_rows
        }

        total_instruments = db.execute(
            select(func.count(Instrument.id))
        ).scalar_one()

        total_applications = db.execute(
            select(func.count(VerificationApplication.id))
        ).scalar_one()

        app_status_rows = db.execute(
            select(VerificationApplication.status, func.count(VerificationApplication.id))
            .group_by(VerificationApplication.status)
        ).all()
        applications_by_status = {
            (s.value if hasattr(s, "value") else str(s)): count
            for s, count in app_status_rows
        }

        inspections = db.execute(select(func.count(Inspection.id))).scalar_one()
        certificates = db.execute(select(func.count(Certificate.id))).scalar_one()

        active_certificates = db.execute(
            select(func.count(Certificate.id)).where(
                Certificate.status == CertificateStatus.ACTIVE,
                Certificate.valid_until >= today,
            )
        ).scalar_one()

        expiring_certificates = db.execute(
            select(func.count(Certificate.id)).where(
                Certificate.status == CertificateStatus.ACTIVE,
                Certificate.valid_until >= today,
                Certificate.valid_until <= warning_date,
            )
        ).scalar_one()

        expired_certificates = db.execute(
            select(func.count(Certificate.id)).where(
                or_(
                    Certificate.status == CertificateStatus.EXPIRED,
                    Certificate.valid_until < today,
                )
            )
        ).scalar_one()

        return {
            "total_users": total_users,
            "users_by_role": users_by_role,
            "total_instruments": total_instruments,
            "total_applications": total_applications,
            "applications_by_status": applications_by_status,
            "inspections": inspections,
            "certificates": certificates,
            "active_certificates": active_certificates,
            "expiring_certificates": expiring_certificates,
            "expired_certificates": expired_certificates,
        }

    def get_chart_data(self, db: Session, *, current_user: User) -> Dict[str, Any]:
        role = current_user.role
        result: Dict[str, Any] = {}

        # 1. Applications by Status
        app_stmt = select(VerificationApplication.status, func.count(VerificationApplication.id))
        if role == UserRole.INSTRUMENT_OWNER:
            app_stmt = app_stmt.where(VerificationApplication.applicant_id == current_user.id)
        app_stmt = app_stmt.group_by(VerificationApplication.status)
        app_rows = db.execute(app_stmt).all()
        result["applications_by_status"] = [
            {"name": (s.value if hasattr(s, "value") else str(s)).replace("_", " ").title(), "value": count}
            for s, count in app_rows
        ]

        # 2. Monthly Trend (last 6 calendar months)
        today = date.today()
        monthly_trend = []
        for i in range(5, -1, -1):
            m = today.month - i
            y = today.year
            while m <= 0:
                m += 12
                y -= 1
            month_start = date(y, m, 1)
            next_month = date(y + 1, 1, 1) if m == 12 else date(y, m + 1, 1)
            month_label = month_start.strftime("%b %y")

            app_cnt_stmt = select(func.count(VerificationApplication.id)).where(
                VerificationApplication.created_at >= month_start,
                VerificationApplication.created_at < next_month,
            )
            if role == UserRole.INSTRUMENT_OWNER:
                app_cnt_stmt = app_cnt_stmt.where(VerificationApplication.applicant_id == current_user.id)
            app_count = db.execute(app_cnt_stmt).scalar_one()

            cert_cnt_stmt = select(func.count(Certificate.id)).where(
                Certificate.issue_date >= month_start,
                Certificate.issue_date < next_month,
            )
            if role == UserRole.INSTRUMENT_OWNER:
                cert_cnt_stmt = cert_cnt_stmt.join(Instrument, Certificate.instrument_id == Instrument.id).where(
                    Instrument.owner_id == current_user.id
                )
            cert_count = db.execute(cert_cnt_stmt).scalar_one()

            monthly_trend.append({
                "month": month_label,
                "applications": app_count,
                "certificates": cert_count,
            })
        result["monthly_trend"] = monthly_trend

        # 3. Role-specific distributions
        if role in [UserRole.ADMIN, UserRole.INSTRUMENT_OWNER]:
            inst_stmt = select(Instrument.instrument_type, func.count(Instrument.id))
            if role == UserRole.INSTRUMENT_OWNER:
                inst_stmt = inst_stmt.where(Instrument.owner_id == current_user.id)
            inst_stmt = inst_stmt.group_by(Instrument.instrument_type)
            inst_rows = db.execute(inst_stmt).all()
            result["instruments_by_type"] = [
                {"name": (t.value if hasattr(t, "value") else str(t)).replace("_", " ").title(), "value": count}
                for t, count in inst_rows
            ]

        if role == UserRole.ADMIN:
            user_rows = db.execute(select(User.role, func.count(User.id)).group_by(User.role)).all()
            result["users_by_role"] = [
                {"name": (r.value if hasattr(r, "value") else str(r)).replace("_", " ").title(), "value": count}
                for r, count in user_rows
            ]

        # 4. Certificate Status distribution
        cert_stmt = select(Certificate.status, func.count(Certificate.id))
        if role == UserRole.INSTRUMENT_OWNER:
            cert_stmt = cert_stmt.join(Instrument, Certificate.instrument_id == Instrument.id).where(
                Instrument.owner_id == current_user.id
            )
        cert_stmt = cert_stmt.group_by(Certificate.status)
        cert_rows = db.execute(cert_stmt).all()
        result["certificates_by_status"] = [
            {"name": (s.value if hasattr(s, "value") else str(s)).title(), "value": count}
            for s, count in cert_rows
        ]

        return result


dashboard_repository = DashboardRepository()
