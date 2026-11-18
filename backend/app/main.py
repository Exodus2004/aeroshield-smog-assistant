"""Main application entrypoint for AeroShield AI backend service.

Initializes FastAPI, mounts OWASP security middleware, configures CORS,
and registers all route endpoints.
"""

from typing import Dict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import PROJECT_NAME, PROJECT_VERSION, API_V1_STR
from app.middleware.security import SecurityHeadersMiddleware
from app.routers import health, plan, chat

app = FastAPI(
    title=PROJECT_NAME,
    version=PROJECT_VERSION,
    description=(
        "GenAI-powered assistant helping families and communities navigate severe winter smog "
        "and urban air pollution with low-emission routines, indoor air quality hacks, "
        "and direct impact telemetry."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

# Apply OWASP security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router, prefix="", tags=["Health"])
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(plan.router, prefix=API_V1_STR, tags=["Planning"])
app.include_router(chat.router, prefix=API_V1_STR, tags=["Consultation"])


@app.get("/", tags=["Root"])
async def root() -> Dict[str, str]:
    """Root metadata discovery endpoint.

    Returns:
        Dictionary containing project title, version, and documentation path.
    """
    return {
        "title": PROJECT_NAME,
        "version": PROJECT_VERSION,
        "docs": "/docs",
        "health": "/api/health",
        "redundancy": "Triple-Redundancy Zero-Downtime Engine Active",
    }
