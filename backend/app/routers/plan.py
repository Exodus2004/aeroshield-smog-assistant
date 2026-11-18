"""Plan generation router for AeroShield AI smog mitigation blueprints."""

from fastapi import APIRouter, status
from app.schemas import PlanRequest, PlanResponse
from app.services.smog_engine import generate_master_smog_plan

router = APIRouter(tags=["Smog Defense Planning"])


@router.post(
    "/plan",
    response_model=PlanResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate master smog defense blueprint",
)
async def create_smog_plan(request: PlanRequest) -> PlanResponse:
    """Generates a complete, personalized smog defense blueprint.

    Args:
        request: Validated household profile and environmental context.

    Returns:
        PlanResponse containing metrics, timeline, hacks, and initiatives.
    """
    return generate_master_smog_plan(request)
