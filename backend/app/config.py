"""Configuration module for AeroShield AI backend service.

Provides environment settings, API key configurations, and default
telemetry constants with strict typing.
"""

from os import getenv
from typing import Final

# API and environment configuration
PROJECT_NAME: Final[str] = "AeroShield AI - Winter Smog & Urban Air Pollution Assistant"
PROJECT_VERSION: Final[str] = "1.0.0"
API_V1_STR: Final[str] = "/api/v1"
GEMINI_API_KEY: Final[str] = getenv("GEMINI_API_KEY", "")
ENVIRONMENT: Final[str] = getenv("ENVIRONMENT", "production")

# Scientific AQI & EPA conversion parameters
DEFAULT_INDOOR_INFILTRATION_RATE: Final[float] = (
    0.55  # Standard unfiltered building envelope
)
CORSI_ROSENTHAL_CLEAN_AIR_DELIVERY_RATE: Final[float] = 0.85  # 85% PM2.5 reduction
HEPA_CLEAN_AIR_DELIVERY_RATE: Final[float] = 0.95  # 95% PM2.5 reduction
AVERAGE_COMMUTE_EMISSION_FACTOR_KG_PER_KM: Final[float] = (
    0.171  # Average gasoline sedan
)
AVERAGE_HUMAN_INHALATION_RATE_M3_DAY: Final[float] = 15.0  # Daily cubic meters inhaled
