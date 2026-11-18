"""Unit tests for service health check and metadata endpoints."""

from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint_success() -> None:
    """Verifies that GET /api/health returns 200 and healthy status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "AeroShield AI" in data["service"]


def test_root_endpoint_metadata() -> None:
    """Verifies that GET / returns service metadata and discovery paths."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "AeroShield AI" in data["title"]
    assert data["docs"] == "/docs"
    assert data["health"] == "/api/health"


def test_redundancy_declaration() -> None:
    """Verifies that health check declares active triple-redundancy engine."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "Triple-Redundancy" in data["engine_redundancy"]
