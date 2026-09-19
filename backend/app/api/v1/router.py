from fastapi import APIRouter
from app.api.v1.applications import router as applications_router
from app.api.v1.auth import router as auth_router
from app.api.v1.certificates import router as certificates_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.health import router as health_router
from app.api.v1.inspections import router as inspections_router
from app.api.v1.instruments import router as instruments_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.reports import router as reports_router

# Central API v1 router
api_router = APIRouter()

# Register resource routers
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(instruments_router)
api_router.include_router(applications_router)
api_router.include_router(inspections_router)
api_router.include_router(certificates_router)
api_router.include_router(dashboard_router)
api_router.include_router(notifications_router)
api_router.include_router(reports_router)

