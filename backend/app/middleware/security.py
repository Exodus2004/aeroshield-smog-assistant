"""OWASP defensive security headers middleware for AeroShield AI.

Applies comprehensive defense-in-depth headers including CSP, HSTS, frame
guarding, and permission policies to all inbound and outbound HTTP requests.
"""

from typing import Callable, Awaitable
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Injects standard OWASP defensive headers into every HTTP response."""

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Processes request and applies strict security headers to response.

        Args:
            request: Inbound HTTP request.
            call_next: Next middleware or route handler callable.

        Returns:
            HTTP response with defensive security headers attached.
        """
        response: Response = await call_next(request)

        # OWASP Recommended defensive headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=()"
        )
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https:;"
        )

        return response
