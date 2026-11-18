"""Unit tests for smog calculation algorithms and diurnal modelling."""

from app.schemas import (
    CommuteMode,
    HeatingSystem,
    LocationType,
    PlanRequest,
    SmogSeverityTier,
    VulnerabilityTier,
    WindowVentilationStatus,
)
from app.services.smog_engine import (
    calculate_smog_severity,
    aqi_to_pm25_concentration,
    pm25_to_aqi,
    compute_impact_metrics,
    generate_diurnal_routine,
    generate_iaq_hacks,
    generate_master_smog_plan,
)


def test_calculate_smog_severity_tiers() -> None:
    """Verifies that all EPA severity tiers map accurately from raw AQI."""
    assert calculate_smog_severity(75) == SmogSeverityTier.MODERATE
    assert calculate_smog_severity(120) == SmogSeverityTier.UNHEALTHY_SENSITIVE
    assert calculate_smog_severity(175) == SmogSeverityTier.UNHEALTHY
    assert calculate_smog_severity(250) == SmogSeverityTier.VERY_UNHEALTHY
    assert calculate_smog_severity(420) == SmogSeverityTier.HAZARDOUS


def test_aqi_to_pm25_conversion_accuracy() -> None:
    """Verifies linear interpolation of PM2.5 concentrations from AQI."""
    pm25_low = aqi_to_pm25_concentration(50)
    assert 11.5 <= pm25_low <= 12.5

    pm25_severe = aqi_to_pm25_concentration(350)
    assert pm25_severe > 250.0

    # Round trip check
    aqi_calc = pm25_to_aqi(pm25_low)
    assert 45 <= aqi_calc <= 55


def test_compute_impact_metrics_positive_savings() -> None:
    """Verifies that impact calculator computes positive particulate and carbon offsets."""
    req = PlanRequest(
        location_name="Industrial Metro",
        current_aqi=320,
        household_members=5,
        vulnerability=VulnerabilityTier.INFANTS_AND_CHILDREN,
        heating_type=HeatingSystem.NATURAL_GAS_FURNACE,
        daily_commute_km=40.0,
        commute_mode=CommuteMode.SOLO_GAS_VEHICLE,
        has_air_purifier=False,
        diy_budget_usd=50.0,
    )
    metrics = compute_impact_metrics(req)
    assert metrics.pm25_exposure_avoided_ug_m3 > 0.0
    assert metrics.daily_co2e_saved_kg > 0.0
    assert metrics.indoor_aqi_projected < req.current_aqi
    assert metrics.health_risk_reduction_pct >= 25.0


def test_generate_diurnal_routine_24h_coverage() -> None:
    """Verifies that diurnal routine contains complete 24-hour cycle with 6 time slots."""
    req = PlanRequest(
        location_name="Salt Lake City",
        current_aqi=190,
        vulnerability=VulnerabilityTier.ASTHMA_RESPIRATORY,
    )
    routine = generate_diurnal_routine(req)
    assert len(routine) == 6
    # Check that controlled ventilation window exists
    vent_slots = [
        r
        for r in routine
        if r.window_status == WindowVentilationStatus.CONTROLLED_FLUSH
    ]
    assert len(vent_slots) == 1
    assert "12:00 - 15:00" in vent_slots[0].time_slot


def test_generate_iaq_hacks_budget_filtering() -> None:
    """Verifies that IAQ hacks include DIY Corsi-Rosenthal specifications."""
    hacks = generate_iaq_hacks(budget_usd=50.0)
    assert len(hacks) >= 4
    corsi_hack = next((h for h in hacks if "Corsi-Rosenthal" in h.title), None)
    assert corsi_hack is not None
    assert corsi_hack.cost_usd <= 35.0
    assert corsi_hack.pm25_reduction_pct >= 80.0


def test_master_smog_plan_orchestration() -> None:
    """Verifies end-to-end plan assembly and field population."""
    req = PlanRequest(
        location_name="Delhi-NCR",
        location_type=LocationType.URBAN_METRO,
        current_aqi=410,
        household_members=3,
        vulnerability=VulnerabilityTier.INFANTS_AND_CHILDREN,
    )
    plan = generate_master_smog_plan(req)
    assert plan.plan_id.startswith("aeroshield-")
    assert plan.smog_severity == SmogSeverityTier.HAZARDOUS
    assert len(plan.hour_by_hour_routine) == 6
    assert len(plan.indoor_air_quality_hacks) >= 4
    assert len(plan.sustainable_alternatives) >= 4
    assert len(plan.community_action_initiatives) >= 3
    assert len(plan.personalized_advisories) >= 2
