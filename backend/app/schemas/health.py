from typing import Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health check response schema for GET /api/v1/health."""
    status: str = Field(..., description="Overall system health status (e.g. 'ok')")
    environment: str = Field(..., description="Current deployment environment")
    version: str = Field("0.1.0", description="API version")
    database: str = Field(..., description="Database connectivity status: 'connected' or 'disconnected'")
    details: Optional[str] = Field(None, description="Optional diagnostic or error message")
