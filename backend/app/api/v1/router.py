from fastapi import APIRouter
from app.api.v1.health import router as health_router

# Central API v1 router
api_router = APIRouter()

# Register resource routers
api_router.include_router(health_router)
