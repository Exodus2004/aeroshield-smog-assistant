"""Health check router for AeroShield AI service monitoring."""

from fastapi import APIRouter
from app.schemas import HealthResponse

router = APIRouter(tags=["Health & Telemetry"])


@router.get("/health", response_model=HealthResponse)
async def get_health_status() -> HealthResponse:
    """Returns current system health and redundancy status.

    Returns:
        HealthResponse object validating service availability.
    """
    return HealthResponse()
