"""Unit tests for OWASP defensive security headers."""

from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_x_content_type_options_nosniff() -> None:
    """Verifies presence of nosniff header to prevent MIME sniffing."""
    response = client.get("/api/health")
    assert response.headers.get("X-Content-Type-Options") == "nosniff"


def test_x_frame_options_deny() -> None:
    """Verifies X-Frame-Options is DENY to prevent clickjacking attacks."""
    response = client.get("/api/health")
    assert response.headers.get("X-Frame-Options") == "DENY"


def test_strict_transport_security_hsts() -> None:
    """Verifies Strict-Transport-Security header enforces HTTPS connections."""
    response = client.get("/api/health")
    hsts = response.headers.get("Strict-Transport-Security")
    assert hsts is not None
    assert "max-age=31536000" in hsts


def test_referrer_policy_and_permissions_policy() -> None:
    """Verifies safe referrer policy and restricted device permissions."""
    response = client.get("/api/health")
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    perms = response.headers.get("Permissions-Policy")
    assert perms is not None
    assert "camera=()" in perms


def test_content_security_policy_present() -> None:
    """Verifies Content-Security-Policy header defines restricted resource origins."""
    response = client.get("/api/health")
    csp = response.headers.get("Content-Security-Policy")
    assert csp is not None
    assert "default-src 'self'" in csp
