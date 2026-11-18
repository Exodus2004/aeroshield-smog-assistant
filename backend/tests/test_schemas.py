"""Unit tests for Pydantic V2 schema validations and input boundaries."""

import pytest
from pydantic import ValidationError

from app.schemas import (
    CommuteMode,
    HeatingSystem,
    LocationType,
    PlanRequest,
    ChatRequest,
    VulnerabilityTier,
)


def test_plan_request_valid_boundaries() -> None:
    """Verifies that well-formed parameters generate valid PlanRequest object."""
    req = PlanRequest(
        location_name="Salt Lake Valley Basin",
        location_type=LocationType.VALLEY_INVERSION,
        current_aqi=185,
        household_members=4,
        vulnerability=VulnerabilityTier.ASTHMA_RESPIRATORY,
        heating_type=HeatingSystem.NATURAL_GAS_FURNACE,
        daily_commute_km=30.0,
        commute_mode=CommuteMode.SOLO_GAS_VEHICLE,
        has_air_purifier=False,
        diy_budget_usd=40.0,
    )
    assert req.current_aqi == 185
    assert req.location_name == "Salt Lake Valley Basin"


def test_plan_request_invalid_aqi_bounds() -> None:
    """Verifies that AQI out-of-bounds raises ValidationError."""
    with pytest.raises(ValidationError):
        PlanRequest(
            location_name="Delhi",
            current_aqi=501,  # Exceeds maximum 500
        )

    with pytest.raises(ValidationError):
        PlanRequest(
            location_name="Delhi",
            current_aqi=0,  # Below minimum 1
        )


def test_plan_request_invalid_location_name() -> None:
    """Verifies that empty or single-character location fails length validation."""
    with pytest.raises(ValidationError):
        PlanRequest(
            location_name="",  # Below min_length 2
            current_aqi=150,
        )


def test_chat_request_validation() -> None:
    """Verifies ChatRequest constraints and defaults."""
    chat_req = ChatRequest(message="How to seal drafty doors?")
    assert chat_req.message == "How to seal drafty doors?"
    assert chat_req.current_aqi == 250

    with pytest.raises(ValidationError):
        ChatRequest(message="")  # Empty query string
