from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.logging import logger
from app.schemas.health import HealthResponse


class HealthService:
    """Service handling system diagnostic and health checks."""

    @staticmethod
    def check_health(db: Session) -> HealthResponse:
        db_status = "disconnected"
        details = None

        try:
            # Simple query to verify DB connection liveness
            db.execute(text("SELECT 1"))
            db_status = "connected"
        except Exception as e:
            logger.warning(f"Database health check failed: {e}")
            details = "Database connection unavailable or not yet configured"

        overall_status = "ok" if db_status == "connected" else "degraded"

        return HealthResponse(
            status=overall_status,
            environment=settings.APP_ENV,
            version="0.1.0",
            database=db_status,
            details=details,
        )


health_service = HealthService()
