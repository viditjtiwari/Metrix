from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.schemas.health import HealthResponse
from app.services.health import health_service

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=HealthResponse, summary="System Health Check")
def get_health(db: Session = Depends(get_db)) -> HealthResponse:
    """
    Check system health including API availability and database connectivity.
    Returns status 'ok' if all systems are nominal, or 'degraded' if DB is unreachable.
    """
    return health_service.check_health(db)
