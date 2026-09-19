from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.dashboard_repository import dashboard_repository
from app.schemas.dashboard import (
    AdminDashboardMetrics,
    DashboardSummaryResponse,
    GatcDashboardMetrics,
    LmoDashboardMetrics,
    OwnerDashboardMetrics,
)


class DashboardService:
    """Service providing role-aware summary statistics computed via direct database aggregations."""

    def get_summary(self, db: Session, *, current_user: User) -> DashboardSummaryResponse:
        role = current_user.role
        warning_days = settings.CERTIFICATE_EXPIRY_WARNING_DAYS

        if role == UserRole.INSTRUMENT_OWNER:
            raw_metrics = dashboard_repository.get_owner_metrics(
                db, owner_id=current_user.id
            )
            metrics = OwnerDashboardMetrics(**raw_metrics)
        elif role == UserRole.LMO:
            raw_metrics = dashboard_repository.get_lmo_metrics(
                db, warning_days=warning_days
            )
            metrics = LmoDashboardMetrics(**raw_metrics)
        elif role == UserRole.GATC:
            raw_metrics = dashboard_repository.get_gatc_metrics(
                db, user_id=current_user.id
            )
            metrics = GatcDashboardMetrics(**raw_metrics)
        elif role == UserRole.ADMIN:
            raw_metrics = dashboard_repository.get_admin_metrics(
                db, warning_days=warning_days
            )
            metrics = AdminDashboardMetrics(**raw_metrics)
        else:
            metrics = {}

        return DashboardSummaryResponse(role=role, metrics=metrics)


dashboard_service = DashboardService()
