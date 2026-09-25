from datetime import date, timedelta
from typing import Any, Dict, List
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session
from app.models.application import VerificationApplication
from app.models.certificate import Certificate
from app.models.enums import ApplicationStatus, CertificateStatus, InspectionMode, InspectionResult, UserRole
from app.models.inspection import Inspection
from app.models.instrument import Instrument
from app.models.user import User


class AnalyticsRepository:
    """Repository executing fast, dynamic SQL database aggregations for role-aware analytics."""

    def get_chart_data(self, db: Session, *, current_user: User) -> Dict[str, Any]:
        role = current_user.role
        result: Dict[str, Any] = {
            "role": role.value if hasattr(role, "value") else str(role),
        }

        # 1. Monthly trend (universal across all roles)
        result["monthly_trend"] = self._get_monthly_trend(db, current_user=current_user)

        # 2. Role-specific dynamic chart series
        if role == UserRole.INSTRUMENT_OWNER:
            result.update(self._get_owner_charts(db, owner_id=current_user.id))
        elif role == UserRole.LMO:
            result.update(self._get_lmo_charts(db, officer_id=current_user.id))
        elif role == UserRole.GATC:
            result.update(self._get_gatc_charts(db, gatc_id=current_user.id))
        elif role == UserRole.ADMIN:
            result.update(self._get_admin_charts(db))

        return result

    def _get_monthly_trend(self, db: Session, *, current_user: User) -> List[Dict[str, Any]]:
        today = date.today()
        trend = []
        role = current_user.role

        for i in range(5, -1, -1):
            m = today.month - i
            y = today.year
            while m <= 0:
                m += 12
                y -= 1
            month_start = date(y, m, 1)
            next_month = date(y + 1, 1, 1) if m == 12 else date(y, m + 1, 1)
            month_label = month_start.strftime("%b %y")

            # Applications count in month
            app_stmt = select(func.count(VerificationApplication.id)).where(
                VerificationApplication.created_at >= month_start,
                VerificationApplication.created_at < next_month,
            )
            if role == UserRole.INSTRUMENT_OWNER:
                app_stmt = app_stmt.where(VerificationApplication.applicant_id == current_user.id)
            elif role == UserRole.GATC:
                app_stmt = app_stmt.join(
                    Inspection, VerificationApplication.id == Inspection.application_id
                ).where(Inspection.assigned_to_id == current_user.id)

            app_count = db.execute(app_stmt).scalar_one()

            # Certificates count in month
            cert_stmt = select(func.count(Certificate.id)).where(
                Certificate.issued_at >= month_start,
                Certificate.issued_at < next_month,
            )
            if role == UserRole.INSTRUMENT_OWNER:
                cert_stmt = cert_stmt.join(
                    Instrument, Certificate.instrument_id == Instrument.id
                ).where(Instrument.owner_id == current_user.id)
            elif role == UserRole.LMO:
                cert_stmt = cert_stmt.where(Certificate.issued_by_id == current_user.id)

            cert_count = db.execute(cert_stmt).scalar_one()

            trend.append({
                "month": month_label,
                "applications": app_count,
                "certificates": cert_count,
            })
        return trend

    def _get_owner_charts(self, db: Session, *, owner_id: int) -> Dict[str, Any]:
        today = date.today()
        data: Dict[str, Any] = {}

        # Applications by Status
        app_rows = db.execute(
            select(VerificationApplication.status, func.count(VerificationApplication.id))
            .where(VerificationApplication.applicant_id == owner_id)
            .group_by(VerificationApplication.status)
        ).all()
        data["applications_by_status"] = [
            {"name": (s.value if hasattr(s, "value") else str(s)).replace("_", " ").title(), "value": count}
            for s, count in app_rows
        ]

        # Instruments by Type
        inst_rows = db.execute(
            select(Instrument.instrument_type, func.count(Instrument.id))
            .where(Instrument.owner_id == owner_id)
            .group_by(Instrument.instrument_type)
        ).all()
        data["instruments_by_type"] = [
            {"name": (t.value if hasattr(t, "value") else str(t)).replace("_", " ").title(), "value": count}
            for t, count in inst_rows
        ]

        # Certificate Health (Timeline Expiry)
        in_30 = today + timedelta(days=30)
        in_60 = today + timedelta(days=60)

        base_cert = select(Certificate).join(Instrument, Certificate.instrument_id == Instrument.id).where(
            Instrument.owner_id == owner_id
        )

        healthy = db.execute(
            select(func.count(Certificate.id)).join(Instrument, Certificate.instrument_id == Instrument.id).where(
                Instrument.owner_id == owner_id,
                Certificate.status == CertificateStatus.ACTIVE,
                Certificate.valid_until > in_60,
            )
        ).scalar_one()

        warning = db.execute(
            select(func.count(Certificate.id)).join(Instrument, Certificate.instrument_id == Instrument.id).where(
                Instrument.owner_id == owner_id,
                Certificate.status == CertificateStatus.ACTIVE,
                Certificate.valid_until > in_30,
                Certificate.valid_until <= in_60,
            )
        ).scalar_one()

        critical = db.execute(
            select(func.count(Certificate.id)).join(Instrument, Certificate.instrument_id == Instrument.id).where(
                Instrument.owner_id == owner_id,
                Certificate.status == CertificateStatus.ACTIVE,
                Certificate.valid_until >= today,
                Certificate.valid_until <= in_30,
            )
        ).scalar_one()

        expired = db.execute(
            select(func.count(Certificate.id)).join(Instrument, Certificate.instrument_id == Instrument.id).where(
                Instrument.owner_id == owner_id,
                or_(Certificate.status == CertificateStatus.EXPIRED, Certificate.valid_until < today),
            )
        ).scalar_one()

        data["certificate_health"] = [
            {"name": "Valid (>60 Days)", "value": healthy, "color": "#10b981"},
            {"name": "Expiring (30-60 Days)", "value": warning, "color": "#f59e0b"},
            {"name": "Urgent (<30 Days)", "value": critical, "color": "#f97316"},
            {"name": "Expired (Overdue)", "value": expired, "color": "#ef4444"},
        ]

        # Verification Outcomes for Owner
        outcomes = db.execute(
            select(Inspection.result, func.count(Inspection.id))
            .join(VerificationApplication, Inspection.application_id == VerificationApplication.id)
            .where(
                VerificationApplication.applicant_id == owner_id,
                Inspection.result.isnot(None),
            )
            .group_by(Inspection.result)
        ).all()
        data["verification_outcomes"] = [
            {"name": (r.value if hasattr(r, "value") else str(r)).title(), "value": count}
            for r, count in outcomes
        ]

        return data

    def _get_lmo_charts(self, db: Session, *, officer_id: int) -> Dict[str, Any]:
        data: Dict[str, Any] = {}

        # 1. Operational Review Pipeline
        app_rows = db.execute(
            select(VerificationApplication.status, func.count(VerificationApplication.id))
            .group_by(VerificationApplication.status)
        ).all()
        data["applications_by_status"] = [
            {"name": (s.value if hasattr(s, "value") else str(s)).replace("_", " ").title(), "value": count}
            for s, count in app_rows
        ]

        # 2. Verification Outcomes (Pass vs Reject)
        outcomes = db.execute(
            select(Inspection.result, func.count(Inspection.id))
            .where(Inspection.result.isnot(None))
            .group_by(Inspection.result)
        ).all()
        data["verification_outcomes"] = [
            {"name": "Verified & Passed" if str(r).endswith("VERIFIED") else "Rejected / Failed", "value": count}
            for r, count in outcomes
        ]

        # 3. Field vs Lab Mode Split
        mode_rows = db.execute(
            select(Inspection.inspection_mode, func.count(Inspection.id))
            .where(Inspection.inspection_mode.isnot(None))
            .group_by(Inspection.inspection_mode)
        ).all()
        data["inspection_modes"] = [
            {
                "name": "LMO Field Inspection" if "FIELD" in str(m) else "GATC Lab Testing",
                "value": count,
            }
            for m, count in mode_rows
        ]

        # 4. Instrument categories verified
        inst_rows = db.execute(
            select(Instrument.instrument_type, func.count(Instrument.id))
            .group_by(Instrument.instrument_type)
        ).all()
        data["instruments_by_type"] = [
            {"name": (t.value if hasattr(t, "value") else str(t)).replace("_", " ").title(), "value": count}
            for t, count in inst_rows
        ]

        # 5. Stamping Quarter Distribution
        q_rows = db.execute(
            select(Inspection.stamp_quarter, func.count(Inspection.id))
            .where(Inspection.stamp_quarter.isnot(None))
            .group_by(Inspection.stamp_quarter)
        ).all()
        data["stamping_quarters"] = [
            {"name": str(q), "value": count} for q, count in q_rows
        ]

        return data

    def _get_gatc_charts(self, db: Session, *, gatc_id: int) -> Dict[str, Any]:
        data: Dict[str, Any] = {}

        # 1. Lab Testing Pipeline
        lab_pipeline = db.execute(
            select(VerificationApplication.status, func.count(VerificationApplication.id))
            .join(Inspection, VerificationApplication.id == Inspection.application_id)
            .where(Inspection.assigned_to_id == gatc_id)
            .group_by(VerificationApplication.status)
        ).all()
        data["applications_by_status"] = [
            {"name": (s.value if hasattr(s, "value") else str(s)).replace("_", " ").title(), "value": count}
            for s, count in lab_pipeline
        ]

        # 2. Lab Outcomes
        outcomes = db.execute(
            select(Inspection.result, func.count(Inspection.id))
            .where(
                Inspection.assigned_to_id == gatc_id,
                Inspection.result.isnot(None),
            )
            .group_by(Inspection.result)
        ).all()
        data["verification_outcomes"] = [
            {"name": "Calibration Passed" if str(r).endswith("VERIFIED") else "Calibration Failed", "value": count}
            for r, count in outcomes
        ]

        # 3. Specialized instruments tested by GATC
        inst_rows = db.execute(
            select(Instrument.instrument_type, func.count(Instrument.id))
            .join(VerificationApplication, Instrument.id == VerificationApplication.instrument_id)
            .join(Inspection, VerificationApplication.id == Inspection.application_id)
            .where(Inspection.assigned_to_id == gatc_id)
            .group_by(Instrument.instrument_type)
        ).all()
        data["instruments_by_type"] = [
            {"name": (t.value if hasattr(t, "value") else str(t)).replace("_", " ").title(), "value": count}
            for t, count in inst_rows
        ]

        return data

    def _get_admin_charts(self, db: Session) -> Dict[str, Any]:
        today = date.today()
        data: Dict[str, Any] = {}

        # 1. National Applications by Status
        app_rows = db.execute(
            select(VerificationApplication.status, func.count(VerificationApplication.id))
            .group_by(VerificationApplication.status)
        ).all()
        data["applications_by_status"] = [
            {"name": (s.value if hasattr(s, "value") else str(s)).replace("_", " ").title(), "value": count}
            for s, count in app_rows
        ]

        # 2. User Roles Distribution
        user_rows = db.execute(
            select(User.role, func.count(User.id)).group_by(User.role)
        ).all()
        data["users_by_role"] = [
            {"name": (r.value if hasattr(r, "value") else str(r)).replace("_", " ").title(), "value": count}
            for r, count in user_rows
        ]

        # 3. National Instruments by Type
        inst_rows = db.execute(
            select(Instrument.instrument_type, func.count(Instrument.id))
            .group_by(Instrument.instrument_type)
        ).all()
        data["instruments_by_type"] = [
            {"name": (t.value if hasattr(t, "value") else str(t)).replace("_", " ").title(), "value": count}
            for t, count in inst_rows
        ]

        # 4. National Certificate Expiry & Compliance
        in_30 = today + timedelta(days=30)
        in_60 = today + timedelta(days=60)

        healthy = db.execute(
            select(func.count(Certificate.id)).where(
                Certificate.status == CertificateStatus.ACTIVE,
                Certificate.valid_until > in_60,
            )
        ).scalar_one()

        warning = db.execute(
            select(func.count(Certificate.id)).where(
                Certificate.status == CertificateStatus.ACTIVE,
                Certificate.valid_until > in_30,
                Certificate.valid_until <= in_60,
            )
        ).scalar_one()

        critical = db.execute(
            select(func.count(Certificate.id)).where(
                Certificate.status == CertificateStatus.ACTIVE,
                Certificate.valid_until >= today,
                Certificate.valid_until <= in_30,
            )
        ).scalar_one()

        expired = db.execute(
            select(func.count(Certificate.id)).where(
                or_(Certificate.status == CertificateStatus.EXPIRED, Certificate.valid_until < today)
            )
        ).scalar_one()

        data["certificate_health"] = [
            {"name": "Compliant (>60 Days)", "value": healthy, "color": "#10b981"},
            {"name": "Renewal Due (30-60 Days)", "value": warning, "color": "#f59e0b"},
            {"name": "Urgent Due (<30 Days)", "value": critical, "color": "#f97316"},
            {"name": "Expired (Overdue)", "value": expired, "color": "#ef4444"},
        ]

        # 5. Field vs Lab Mode Split
        mode_rows = db.execute(
            select(Inspection.inspection_mode, func.count(Inspection.id))
            .where(Inspection.inspection_mode.isnot(None))
            .group_by(Inspection.inspection_mode)
        ).all()
        data["inspection_modes"] = [
            {
                "name": "LMO Field Inspection" if "FIELD" in str(m) else "GATC Lab Testing",
                "value": count,
            }
            for m, count in mode_rows
        ]

        # 6. Nationwide Verification Results (Pass vs Reject)
        outcomes = db.execute(
            select(Inspection.result, func.count(Inspection.id))
            .where(Inspection.result.isnot(None))
            .group_by(Inspection.result)
        ).all()
        data["verification_outcomes"] = [
            {"name": "Verified & Passed" if str(r).endswith("VERIFIED") else "Rejected / Non-Compliant", "value": count}
            for r, count in outcomes
        ]

        return data


analytics_repository = AnalyticsRepository()
