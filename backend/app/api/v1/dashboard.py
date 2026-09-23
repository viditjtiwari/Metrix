from typing import Any, Dict
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.dashboard import DashboardSummaryResponse
from app.services.dashboard_service import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Role-Aware Dashboard Summary",
)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DashboardSummaryResponse:
    """Retrieve operational dashboard metrics aggregated by database for authenticated user's role."""
    return dashboard_service.get_summary(db, current_user=current_user)


@router.get(
    "/charts",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK,
    summary="Get Role-Aware Dashboard Analytics Charts",
)
def get_dashboard_charts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieve statistical series and distributions formatted for role-aware charts."""
    return dashboard_service.get_chart_data(db, current_user=current_user)
