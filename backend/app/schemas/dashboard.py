from typing import Any, Dict, Union
from pydantic import BaseModel
from app.models.enums import UserRole


class OwnerDashboardMetrics(BaseModel):
    total_instruments: int
    total_applications: int
    pending_applications: int
    scheduled_inspections: int
    verified_applications: int
    rejected_applications: int
    active_certificates: int
    expired_certificates: int


class LmoDashboardMetrics(BaseModel):
    applications_pending_review: int
    scheduled_inspections: int
    inspections_in_progress: int
    completed_inspections: int
    verified_applications: int
    rejected_applications: int
    certificates_issued: int
    certificates_expiring: int


class GatcDashboardMetrics(BaseModel):
    assigned_inspections: int
    scheduled_inspections: int
    inspections_in_progress: int
    completed_inspections: int
    verification_results: int


class AdminDashboardMetrics(BaseModel):
    total_users: int
    users_by_role: Dict[str, int]
    total_instruments: int
    total_applications: int
    applications_by_status: Dict[str, int]
    inspections: int
    certificates: int
    active_certificates: int
    expiring_certificates: int
    expired_certificates: int


class DashboardSummaryResponse(BaseModel):
    role: UserRole
    metrics: Union[
        OwnerDashboardMetrics,
        LmoDashboardMetrics,
        GatcDashboardMetrics,
        AdminDashboardMetrics,
        Dict[str, Any],
    ]
