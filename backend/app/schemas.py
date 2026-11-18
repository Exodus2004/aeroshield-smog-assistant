"""Pydantic V2 schemas and data validation models for AeroShield AI.

Defines input boundaries, enumerations, response contracts, and
telemetry metrics for winter smog and air pollution mitigation.
"""

from enum import Enum
from typing import List
from pydantic import BaseModel, Field


class LocationType(str, Enum):
    """Geographical topology categorization for smog trapping dynamics."""

    URBAN_METRO = "URBAN_METRO"
    VALLEY_INVERSION = "VALLEY_INVERSION"
    INDUSTRIAL_CORRIDOR = "INDUSTRIAL_CORRIDOR"
    SUBURBAN_RESIDENTIAL = "SUBURBAN_RESIDENTIAL"


class VulnerabilityTier(str, Enum):
    """Health susceptibility tier for household residents."""

    INFANTS_AND_CHILDREN = "INFANTS_AND_CHILDREN"
    ELDERLY_CARDIOVASCULAR = "ELDERLY_CARDIOVASCULAR"
    ASTHMA_RESPIRATORY = "ASTHMA_RESPIRATORY"
    ACTIVE_COMMUTERS = "ACTIVE_COMMUTERS"
    GENERAL_HOUSEHOLD = "GENERAL_HOUSEHOLD"


class HeatingSystem(str, Enum):
    """Primary household winter heating mechanism."""

    NATURAL_GAS_FURNACE = "NATURAL_GAS_FURNACE"
    ELECTRIC_HEAT_PUMP = "ELECTRIC_HEAT_PUMP"
    WOOD_FIREPLACE_BIOMASS = "WOOD_FIREPLACE_BIOMASS"
    DISTRICT_RADIATOR = "DISTRICT_RADIATOR"
    ELECTRIC_SPACE_HEATERS = "ELECTRIC_SPACE_HEATERS"


class CommuteMode(str, Enum):
    """Daily transit transportation method."""

    SOLO_GAS_VEHICLE = "SOLO_GAS_VEHICLE"
    CARPOOL_HYBRID_EV = "CARPOOL_HYBRID_EV"
    ELECTRIC_METRO_BUS = "ELECTRIC_METRO_BUS"
    ACTIVE_CYCLING_WALK = "ACTIVE_CYCLING_WALK"
    WORK_FROM_HOME = "WORK_FROM_HOME"


class SmogSeverityTier(str, Enum):
    """EPA AQI severity rating for outdoor air quality."""

    MODERATE = "MODERATE"
    UNHEALTHY_SENSITIVE = "UNHEALTHY_SENSITIVE"
    UNHEALTHY = "UNHEALTHY"
    VERY_UNHEALTHY = "VERY_UNHEALTHY"
    HAZARDOUS = "HAZARDOUS"


class WindowVentilationStatus(str, Enum):
    """Indoor ventilation window advisory state."""

    SEALED_SHUT = "SEALED_SHUT"
    CONTROLLED_FLUSH = "CONTROLLED_FLUSH"
    RESTRICTED = "RESTRICTED"


class PlanRequest(BaseModel):
    """Request payload containing household profile and environmental context."""

    location_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Name of the city, region, or neighborhood",
        examples=["Delhi-NCR Metro"],
    )
    location_type: LocationType = Field(
        default=LocationType.URBAN_METRO,
        description="Topographical smog characteristic",
    )
    current_aqi: int = Field(
        ...,
        ge=1,
        le=500,
        description="Current outdoor Air Quality Index (1-500)",
        examples=[385],
    )
    household_members: int = Field(
        default=3,
        ge=1,
        le=20,
        description="Number of individuals residing in the home",
    )
    vulnerability: VulnerabilityTier = Field(
        default=VulnerabilityTier.INFANTS_AND_CHILDREN,
        description="Highest health vulnerability tier in household",
    )
    heating_type: HeatingSystem = Field(
        default=HeatingSystem.NATURAL_GAS_FURNACE,
        description="Primary heating method",
    )
    daily_commute_km: float = Field(
        default=22.5,
        ge=0.0,
        le=200.0,
        description="Total round-trip commute distance in kilometers",
    )
    commute_mode: CommuteMode = Field(
        default=CommuteMode.SOLO_GAS_VEHICLE,
        description="Primary transit mode",
    )
    has_air_purifier: bool = Field(
        default=False,
        description="Whether home currently operates certified air purifiers",
    )
    diy_budget_usd: float = Field(
        default=45.0,
        ge=0.0,
        le=1000.0,
        description="Available budget for DIY air quality improvements in USD",
    )


class DirectImpactMetrics(BaseModel):
    """Quantified environmental and health impact telemetry."""

    pm25_exposure_avoided_ug_m3: float = Field(
        ...,
        description="Estimated reduction in indoor PM2.5 particle density",
    )
    daily_co2e_saved_kg: float = Field(
        ...,
        description="Estimated daily kilograms of CO2 equivalent emissions prevented",
    )
    indoor_aqi_projected: int = Field(
        ...,
        description="Target indoor Air Quality Index after adopting recommendations",
    )
    estimated_monthly_savings_usd: float = Field(
        ...,
        description="Estimated monthly cost savings compared to commercial purifiers",
    )
    health_risk_reduction_pct: float = Field(
        ...,
        description="Percentage drop in acute particulate inhalation risk",
    )


class RoutineHour(BaseModel):
    """Hour-by-hour operational recommendation for winter smog days."""

    time_slot: str = Field(..., description="Time window, e.g., '07:00 - 09:00'")
    window_status: WindowVentilationStatus = Field(
        ...,
        description="Indoor window ventilation instruction",
    )
    activity_recommendation: str = Field(
        ...,
        description="Safe lifestyle or work recommendation",
    )
    emission_guidance: str = Field(
        ...,
        description="Action to minimize household carbon and smoke emissions",
    )
    health_alert: str = Field(
        ...,
        description="Medical and respiratory precautionary advisory",
    )


class IAQHack(BaseModel):
    """Actionable indoor air quality engineering hack."""

    title: str = Field(..., description="Descriptive title of the hack")
    category: str = Field(
        ..., description="Category: Filtration, Ventilation, or Source Control"
    )
    cost_usd: float = Field(..., description="Estimated DIY implementation cost in USD")
    pm25_reduction_pct: float = Field(
        ..., description="Estimated PM2.5 reduction efficiency percentage"
    )
    materials_needed: List[str] = Field(..., description="Itemized required materials")
    step_by_step_instructions: List[str] = Field(
        ...,
        description="Clear sequential instructions for assembly or execution",
    )
    scientific_rationale: str = Field(
        ...,
        description="Peer-reviewed or empirical explanation of efficacy",
    )


class SustainableAlternative(BaseModel):
    """Sustainable lifestyle replacement for high-emission winter practices."""

    domain: str = Field(
        ..., description="Domain: Heating, Mobility, Energy, or Cooking"
    )
    current_practice: str = Field(..., description="Common high-emission habit")
    sustainable_switch: str = Field(..., description="Clean, low-emission alternative")
    carbon_saving_desc: str = Field(
        ..., description="Quantified or qualitative carbon reduction"
    )
    community_benefit: str = Field(
        ..., description="Neighborhood-level air quality improvement"
    )


class CommunityInitiative(BaseModel):
    """Neighborhood and community-scale collective action item."""

    initiative_name: str = Field(..., description="Name of collective campaign")
    action_items: List[str] = Field(..., description="Steps for neighborhood execution")
    neighborhood_impact: str = Field(
        ..., description="Expected local community air benefit"
    )


class PlanResponse(BaseModel):
    """Comprehensive blueprint response tailored to household context."""

    plan_id: str = Field(..., description="Unique generated blueprint identifier")
    generated_at: str = Field(..., description="ISO 8601 creation timestamp")
    smog_severity: SmogSeverityTier = Field(..., description="Severity classification")
    executive_summary: str = Field(..., description="Concise plan overview")
    direct_impact_metrics: DirectImpactMetrics = Field(
        ...,
        description="Quantified telemetry figures",
    )
    hour_by_hour_routine: List[RoutineHour] = Field(
        ...,
        description="24-hour diurnal smog mitigation timeline",
    )
    indoor_air_quality_hacks: List[IAQHack] = Field(
        ...,
        description="Low-cost DIY indoor air quality engineering hacks",
    )
    sustainable_alternatives: List[SustainableAlternative] = Field(
        ...,
        description="Clean lifestyle alternatives",
    )
    community_action_initiatives: List[CommunityInitiative] = Field(
        ...,
        description="Neighborhood coordination actions",
    )
    personalized_advisories: List[str] = Field(
        ...,
        description="Targeted health notices for vulnerable family members",
    )


class ChatMessage(BaseModel):
    """Single chat turn representation."""

    role: str = Field(..., description="Role: 'user' or 'assistant'")
    content: str = Field(..., min_length=1, max_length=2000, description="Message body")


class ChatRequest(BaseModel):
    """Interactive consultation request."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="User question or inquiry",
        examples=["How do I build a Corsi-Rosenthal box under $35?"],
    )
    current_aqi: int = Field(
        default=250, ge=1, le=500, description="Current ambient AQI"
    )
    vulnerability: VulnerabilityTier = Field(
        default=VulnerabilityTier.GENERAL_HOUSEHOLD,
        description="Target household vulnerability",
    )
    history: List[ChatMessage] = Field(
        default_factory=list,
        description="Prior conversational turns",
    )


class ChatResponse(BaseModel):
    """Interactive advisor response with actionable recommendations."""

    reply: str = Field(..., description="Assistant response text")
    suggested_quick_chips: List[str] = Field(
        default_factory=list,
        description="Contextual follow-up prompt suggestions",
    )
    actionable_takeaway: str = Field(
        ...,
        description="Primary immediate action the user can take",
    )


class HealthResponse(BaseModel):
    """System health check status contract."""

    status: str = Field(default="healthy", description="Service health state")
    service: str = Field(
        default="AeroShield AI Backend", description="Service identifier"
    )
    version: str = Field(default="1.0.0", description="Semver version string")
    engine_redundancy: str = Field(
        default="Triple-Redundancy Zero-Downtime Active",
        description="Fault-tolerance status",
    )
