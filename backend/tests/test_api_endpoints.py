"""Integration tests for FastAPI route endpoints."""

from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_post_plan_endpoint_success() -> None:
    """Verifies that POST /api/v1/plan successfully returns complete plan payload."""
    payload = {
        "location_name": "Beijing Urban Valley",
        "location_type": "VALLEY_INVERSION",
        "current_aqi": 275,
        "household_members": 3,
        "vulnerability": "ELDERLY_CARDIOVASCULAR",
        "heating_type": "DISTRICT_RADIATOR",
        "daily_commute_km": 15.0,
        "commute_mode": "ELECTRIC_METRO_BUS",
        "has_air_purifier": True,
        "diy_budget_usd": 60.0,
    }
    response = client.post("/api/v1/plan", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "plan_id" in data
    assert data["smog_severity"] == "VERY_UNHEALTHY"
    assert "direct_impact_metrics" in data
    assert data["direct_impact_metrics"]["indoor_aqi_projected"] < 275
    assert len(data["hour_by_hour_routine"]) == 6


def test_post_chat_endpoint_fallback_success() -> None:
    """Verifies that POST /api/v1/chat responds reliably without errors."""
    payload = {
        "message": "How do I build a DIY Corsi-Rosenthal box?",
        "current_aqi": 300,
        "vulnerability": "INFANTS_AND_CHILDREN",
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "suggested_quick_chips" in data
    assert len(data["suggested_quick_chips"]) > 0
    assert "actionable_takeaway" in data
