"""Deterministic domain calculation engine for AeroShield AI.

Implements scientific EPA AQI/PM2.5 conversions, diurnal temperature inversion
modelling, building envelope infiltration calculations, and carbon savings telemetry.
"""

from datetime import datetime, timezone
import uuid
from typing import List

from app.schemas import (
    CommuteMode,
    CommunityInitiative,
    DirectImpactMetrics,
    HeatingSystem,
    IAQHack,
    LocationType,
    PlanRequest,
    PlanResponse,
    RoutineHour,
    SmogSeverityTier,
    SustainableAlternative,
    VulnerabilityTier,
    WindowVentilationStatus,
)


def calculate_smog_severity(aqi: int) -> SmogSeverityTier:
    """Classifies raw AQI into EPA standardized smog severity tiers.

    Args:
        aqi: Air Quality Index value (1-500).

    Returns:
        SmogSeverityTier enum corresponding to pollution level.
    """
    if aqi <= 100:
        return SmogSeverityTier.MODERATE
    if aqi <= 150:
        return SmogSeverityTier.UNHEALTHY_SENSITIVE
    if aqi <= 200:
        return SmogSeverityTier.UNHEALTHY
    if aqi <= 300:
        return SmogSeverityTier.VERY_UNHEALTHY
    return SmogSeverityTier.HAZARDOUS


def aqi_to_pm25_concentration(aqi: int) -> float:
    """Converts EPA AQI into approximate PM2.5 particle mass concentration (ug/m3).

    Utilizes standard EPA piecewise linear interpolation breakpoints.

    Args:
        aqi: Air Quality Index value (1-500).

    Returns:
        Concentration of PM2.5 in micrograms per cubic meter (ug/m3).
    """
    if aqi <= 50:
        return round((aqi / 50.0) * 12.0, 1)
    if aqi <= 100:
        return round(12.1 + ((aqi - 51) / 49.0) * (35.4 - 12.1), 1)
    if aqi <= 150:
        return round(35.5 + ((aqi - 101) / 49.0) * (55.4 - 35.5), 1)
    if aqi <= 200:
        return round(55.5 + ((aqi - 151) / 49.0) * (150.4 - 55.5), 1)
    if aqi <= 300:
        return round(150.5 + ((aqi - 201) / 99.0) * (250.4 - 150.5), 1)
    return round(250.5 + ((aqi - 301) / 199.0) * (500.0 - 250.5), 1)


def pm25_to_aqi(pm25: float) -> int:
    """Converts PM2.5 concentration (ug/m3) back to EPA AQI value.

    Args:
        pm25: PM2.5 concentration in ug/m3.

    Returns:
        Integer AQI value clamped between 1 and 500.
    """
    if pm25 <= 12.0:
        return max(1, int((pm25 / 12.0) * 50.0))
    if pm25 <= 35.4:
        return int(51 + ((pm25 - 12.1) / (35.4 - 12.1)) * 49.0)
    if pm25 <= 55.4:
        return int(101 + ((pm25 - 35.5) / (55.4 - 35.5)) * 49.0)
    if pm25 <= 150.4:
        return int(151 + ((pm25 - 55.5) / (150.4 - 55.5)) * 49.0)
    if pm25 <= 250.4:
        return int(201 + ((pm25 - 150.5) / (250.4 - 150.5)) * 99.0)
    return min(500, int(301 + ((pm25 - 250.5) / (500.0 - 250.5)) * 199.0))


def compute_impact_metrics(request: PlanRequest) -> DirectImpactMetrics:
    """Computes exact health, particulate exposure, and carbon reduction metrics.

    Args:
        request: Validated user plan parameters.

    Returns:
        DirectImpactMetrics instance with quantified telemetry.
    """
    outdoor_pm25 = aqi_to_pm25_concentration(request.current_aqi)

    # Building envelope base infiltration (55% without filtration)
    unfiltered_indoor_pm25 = outdoor_pm25 * 0.55

    # Determine filtration efficiency
    filtration_efficiency = 0.35  # Standard window sealing
    if request.has_air_purifier:
        filtration_efficiency = 0.90
    elif request.diy_budget_usd >= 30.0:
        filtration_efficiency = 0.82  # Corsi-Rosenthal box efficiency

    target_indoor_pm25 = max(5.0, outdoor_pm25 * (1.0 - filtration_efficiency))
    pm25_avoided = max(0.0, unfiltered_indoor_pm25 - target_indoor_pm25)
    projected_indoor_aqi = pm25_to_aqi(target_indoor_pm25)

    # Carbon savings calculations (commute + heating)
    co2e_per_km = 0.171  # kg CO2/km for gasoline vehicle
    commute_factor = 0.0
    if request.commute_mode == CommuteMode.SOLO_GAS_VEHICLE:
        commute_factor = 0.70  # Potential savings by switching to carpool or metro
    elif request.commute_mode == CommuteMode.CARPOOL_HYBRID_EV:
        commute_factor = 0.35
    elif request.commute_mode == CommuteMode.ELECTRIC_METRO_BUS:
        commute_factor = 0.15

    daily_commute_saved_co2e = request.daily_commute_km * co2e_per_km * commute_factor

    # Heating carbon offset
    heating_saved_co2e = 0.0
    if request.heating_type == HeatingSystem.WOOD_FIREPLACE_BIOMASS:
        heating_saved_co2e = 4.2  # kg CO2e saved by avoiding dirty wood burning
    elif request.heating_type == HeatingSystem.NATURAL_GAS_FURNACE:
        heating_saved_co2e = 1.8  # Thermostat setback and draft sealing

    total_daily_co2e_saved = round(daily_commute_saved_co2e + heating_saved_co2e, 2)

    # Financial savings (DIY vs expensive commercial units & medical savings)
    estimated_monthly_savings = 35.0
    if request.has_air_purifier:
        estimated_monthly_savings = 22.0
    elif request.diy_budget_usd >= 30.0:
        estimated_monthly_savings = (
            58.0  # Significant savings vs $300 commercial HEPA unit
        )

    # Health risk drop percentage
    risk_drop = min(92.0, max(25.0, filtration_efficiency * 100.0))

    return DirectImpactMetrics(
        pm25_exposure_avoided_ug_m3=round(pm25_avoided, 1),
        daily_co2e_saved_kg=total_daily_co2e_saved,
        indoor_aqi_projected=projected_indoor_aqi,
        estimated_monthly_savings_usd=estimated_monthly_savings,
        health_risk_reduction_pct=round(risk_drop, 1),
    )


def generate_diurnal_routine(request: PlanRequest) -> List[RoutineHour]:
    """Synthesizes an hour-by-hour operational schedule based on winter inversion physics.

    In winter, boundary layer air cools overnight and traps particulates near the surface.
    Thermal inversions are strongest between 06:00 and 10:00, break partially around 13:00-15:00,
    and reform heavily after sunset (18:00+).

    Args:
        request: Validated household request.

    Returns:
        List of RoutineHour objects for a 24-hour cycle.
    """
    routine: List[RoutineHour] = [
        RoutineHour(
            time_slot="06:00 - 09:00",
            window_status=WindowVentilationStatus.SEALED_SHUT,
            activity_recommendation="Morning thermal inversion peak. Keep all windows sealed. Conduct indoor workouts; cancel outdoor jogs or walks.",
            emission_guidance="Avoid cold-engine car idling. If driving, set HVAC strictly to 'Cabin Recirculation'. Avoid wood stove ignition.",
            health_alert=f"High risk for {request.vulnerability.value.replace('_', ' ').title()}. Take preventive prescribed inhalers 15 minutes before waking activities.",
        ),
        RoutineHour(
            time_slot="09:00 - 12:00",
            window_status=WindowVentilationStatus.SEALED_SHUT,
            activity_recommendation="Deep work / school hours. Run indoor DIY Corsi-Rosenthal boxes or HEPA filtration on medium-high speed in occupied rooms.",
            emission_guidance="Batch household electrical appliances during mid-morning off-peak solar hours where possible.",
            health_alert="Particulate concentration remains severe at street level. Wear well-fitted N95/FFP2 masks for any essential outdoor transit.",
        ),
        RoutineHour(
            time_slot="12:00 - 15:00",
            window_status=WindowVentilationStatus.CONTROLLED_FLUSH,
            activity_recommendation="Solar heating mixes the lower atmospheric boundary layer, causing temporary dispersion. Best safe window for essential outdoor tasks.",
            emission_guidance="Consolidate errands into a single combined multi-stop trip to avoid multiple cold-engine vehicle starts.",
            health_alert="Check live sensor readings. If local AQI drops below 150, perform a brief 10-minute cross-ventilation air exchange, then reseal.",
        ),
        RoutineHour(
            time_slot="15:00 - 18:00",
            window_status=WindowVentilationStatus.RESTRICTED,
            activity_recommendation="School run & evening commute prep. Utilize neighborhood carpools, electric metro, or protected transit corridors.",
            emission_guidance="Zero idling in school pickup zones. Advocate for car-free pedestrian buffer zones within 200m of schools.",
            health_alert="Vulnerable family members should return indoors before sunset. Reseal all external doors and draft seals.",
        ),
        RoutineHour(
            time_slot="18:00 - 21:00",
            window_status=WindowVentilationStatus.SEALED_SHUT,
            activity_recommendation="Evening dinner & relaxation. Use ducted kitchen range hoods while cooking; avoid pan-frying or open grilling which spikes indoor PM2.5.",
            emission_guidance="Switch to clean electric heating or low-temperature radiant heat; do not ignite decorative fireplaces or biomass burners.",
            health_alert="Run air filtration in living areas. Hydrate and use saline nasal rinses to clear upper airway particulate matter.",
        ),
        RoutineHour(
            time_slot="21:00 - 06:00",
            window_status=WindowVentilationStatus.SEALED_SHUT,
            activity_recommendation="Overnight sleep protection. Relocate air purifier directly into the primary bedroom; run on continuous low/whisper mode.",
            emission_guidance="Lower central heating thermostat by 2°C (3.6°F) and use insulating thermal blankets to curb nighttime furnace emissions.",
            health_alert="Maintain bedroom humidity between 40%-50% to prevent mucosal drying and enhance respiratory cilia filtration.",
        ),
    ]
    return routine


def generate_iaq_hacks(budget_usd: float) -> List[IAQHack]:
    """Generates actionable low-cost indoor air quality engineering hacks.

    Args:
        budget_usd: Available budget in USD.

    Returns:
        List of structured IAQHack objects.
    """
    hacks: List[IAQHack] = [
        IAQHack(
            title="DIY Corsi-Rosenthal Box Air Cleaner",
            category="Filtration Engineering",
            cost_usd=32.0,
            pm25_reduction_pct=85.0,
            materials_needed=[
                "One 20x20-inch Box Fan ($18)",
                "Four MERV-13 Furnace Filters ($12 total)",
                "Duct tape or painter's tape ($2)",
                "Cardboard bottom shroud",
            ],
            step_by_step_instructions=[
                "Form an open cube using the 4 MERV-13 filters, with arrows pointing inward toward the center.",
                "Tape the edges of the 4 filters securely to create an airtight square frame.",
                "Cut a cardboard square to seal the bottom opening and tape tightly.",
                "Place the 20-inch box fan on top, blowing upward (away from the cube), and tape the seam.",
                "Power on at speed 1 or 2 for high-volume, low-noise particulate filtration exceeding $300 commercial units.",
            ],
            scientific_rationale="Tested by UC Davis and EPA: Corsi-Rosenthal boxes achieve Clean Air Delivery Rates (CADR) of 200-250 CFM for PM2.5 at less than 15% the cost of HEPA appliances.",
        ),
        IAQHack(
            title="Positive-Pressure Clean Zone Protocol",
            category="Ventilation & Sealing",
            cost_usd=8.5,
            pm25_reduction_pct=60.0,
            materials_needed=[
                "Weatherstripping foam tape ($5)",
                "Under-door draft stopper or rolled damp towel ($3.5)",
            ],
            step_by_step_instructions=[
                "Designate the primary bedroom as the designated 'Clean Air Sanctuary'.",
                "Apply foam weatherstripping along window frames to block smog infiltration gaps.",
                "Place an under-door draft stopper to prevent dirty hallway air from entering.",
                "Run an air cleaner continuously in this single sealed room to create a low-particulate haven.",
            ],
            scientific_rationale="Concentrating filtration capacity in a single well-sealed room achieves indoor PM2.5 reductions of 60-80% even when the rest of the dwelling remains unsealed.",
        ),
        IAQHack(
            title="Cooking Emission Suppression Protocol",
            category="Source Control",
            cost_usd=0.0,
            pm25_reduction_pct=45.0,
            materials_needed=[
                "Existing kitchen exhaust hood",
                "Cookware lids",
            ],
            step_by_step_instructions=[
                "Always cook on the back burners where exhaust hood suction is 2.5x more efficient.",
                "Turn the range hood to high 2 minutes BEFORE igniting burners, establishing an active air draft.",
                "Keep pots and pans covered with lids to prevent aerosolized oils and particulate release.",
                "Leave the exhaust fan running for 10 minutes post-cooking, keeping kitchen doors closed to living areas.",
            ],
            scientific_rationale="Indoor cooking (especially frying) creates transient PM2.5 spikes exceeding 300 ug/m3. Back-burner usage with pre-draft suction captures up to 75% of cooking aerosols at source.",
        ),
        IAQHack(
            title="Electrostatic Pre-Filter Fan Retrofit",
            category="Filtration Engineering",
            cost_usd=14.0,
            pm25_reduction_pct=50.0,
            materials_needed=[
                "Single MERV-11 or MERV-13 20x20 filter ($9)",
                "Bungee cord or painter's tape ($5)",
                "Standard household box fan",
            ],
            step_by_step_instructions=[
                "Fasten a single MERV-13 filter directly to the intake (back) side of your box fan.",
                "Ensure arrow points toward the fan blades (direction of airflow).",
                "Secure with two criss-crossed bungee cords or perimeter tape.",
                "Run in occupied spaces for rapid budget particulate reduction.",
            ],
            scientific_rationale="Provides immediate 50% single-pass PM2.5 reduction with minimal static pressure drop, ideal for budget-constrained apartments.",
        ),
    ]

    if budget_usd < 20.0:
        # Prioritize zero/low cost options first
        hacks.reverse()

    return hacks


def generate_sustainable_alternatives(
    heating: HeatingSystem, commute: CommuteMode
) -> List[SustainableAlternative]:
    """Provides practical sustainable alternatives with quantified carbon and smog savings.

    Args:
        heating: Current heating system.
        commute: Current commute mode.

    Returns:
        List of SustainableAlternative items.
    """
    alternatives: List[SustainableAlternative] = [
        SustainableAlternative(
            domain="Mobility & Commuting",
            current_practice="Solo gasoline vehicle commute during morning inversion hours.",
            sustainable_switch="Switch to electric bus, metro transit, or 3-person neighborhood carpooling clusters.",
            carbon_saving_desc="Prevents ~3.8 kg CO2e and eliminates direct toxic NOx exhaust at street level daily.",
            community_benefit="Reduces vehicle cold-start emissions by 66% during the most dangerous morning temperature inversions.",
        ),
        SustainableAlternative(
            domain="Household Space Heating",
            current_practice="Continuous high-temperature gas furnace or wood-burning stove heating.",
            sustainable_switch="Pair smart programmable thermostat set to 19°C (66°F) with high-efficiency heat pump and radiant heat zoning.",
            carbon_saving_desc="Saves 350-600 kg CO2e per winter season and reduces local particulate soot to absolute zero.",
            community_benefit="Eliminates ground-level chimney smoke plumes that settle into neighboring valley air basins.",
        ),
        SustainableAlternative(
            domain="Community Yard Waste Management",
            current_practice="Open-air burning of dry autumn leaves, garden debris, or organic crop biomass.",
            sustainable_switch="Community centralized microbial composting and anaerobic municipal soil mulching.",
            carbon_saving_desc="Avoids 1,200 kg CO2e and prevents massive localized spikes of benzo[a]pyrene carcinogens.",
            community_benefit="Prevents dense ground-level smoke haze blankets from accumulating in residential streets.",
        ),
        SustainableAlternative(
            domain="Indoor Air Conditioning & Ventilation",
            current_practice="Unfiltered natural draft ventilation during peak afternoon traffic hours.",
            sustainable_switch="Smart scheduled ventilation timed to midday solar convection mixing windows.",
            carbon_saving_desc="Reduces HVAC fan strain and saves ~1.2 kWh electricity daily.",
            community_benefit="Optimizes clean indoor zones without overloading the neighborhood power grid during winter evenings.",
        ),
    ]
    return alternatives


def generate_community_initiatives(
    location_type: LocationType,
) -> List[CommunityInitiative]:
    """Generates collective neighborhood-scale clean air initiatives.

    Args:
        location_type: Geographical location type.

    Returns:
        List of CommunityInitiative objects.
    """
    initiatives: List[CommunityInitiative] = [
        CommunityInitiative(
            initiative_name="Clean Air School Streets & Idling Free Buffer Zones",
            action_items=[
                "Establish a mandatory 250-meter vehicle-free drop-off perimeter around local schools during 07:30-08:30.",
                "Enact strict engine anti-idling rules for school buses and parent pickup vehicles.",
                "Install a real-time hyper-local community AQI display at the school gate.",
            ],
            neighborhood_impact="Reduces children's acute particulate exposure during arrival by up to 40% during inversion peaks.",
        ),
        CommunityInitiative(
            initiative_name="Neighborhood Corsi-Rosenthal Box Assembly Cooperative",
            action_items=[
                "Bulk-purchase box fans and MERV-13 filters at wholesale trade discounts (saving 35%).",
                "Host a weekend community workshop to build 50+ DIY air cleaners for vulnerable elderly and families.",
                "Distribute completed units to community centers, public clinics, and low-income residences.",
            ],
            neighborhood_impact="Establishes community-wide resilience and ensures clean air equity for vulnerable residents.",
        ),
        CommunityInitiative(
            initiative_name="Hyper-Local Community Air Sensor Network",
            action_items=[
                "Deploy 5 low-cost open-source particulate monitors (e.g., PurpleAir / AirGradient) across the neighborhood.",
                "Link data to a free community dashboard showing street-by-street microclimate air quality variations.",
                "Provide early warning alerts before evening temperature inversions trap surface smoke.",
            ],
            neighborhood_impact="Empowers families to coordinate outdoor activities and ventilation based on empirical street-level data.",
        ),
    ]
    return initiatives


def generate_personalized_advisories(
    vulnerability: VulnerabilityTier, aqi: int
) -> List[str]:
    """Generates personalized medical and lifestyle precautions.

    Args:
        vulnerability: Household health category.
        aqi: Current ambient AQI.

    Returns:
        List of targeted advisory strings.
    """
    advisories: List[str] = []

    if vulnerability == VulnerabilityTier.INFANTS_AND_CHILDREN:
        advisories.append(
            "Children inhale 50% more air per pound of body weight than adults: Keep outdoor playtime strictly indoors whenever AQI exceeds 150."
        )
        advisories.append(
            "Ensure school classrooms have operational filtration; provide a well-fitted child-sized KF94/KN95 mask for transit."
        )
    elif vulnerability == VulnerabilityTier.ELDERLY_CARDIOVASCULAR:
        advisories.append(
            "Fine particulates (PM2.5) enter the bloodstream, causing vascular inflammation: Monitor blood pressure daily and maintain strict medication routines."
        )
        advisories.append(
            "Avoid strenuous indoor or outdoor exertion that increases cardiac workload during high AQI alerts."
        )
    elif vulnerability == VulnerabilityTier.ASTHMA_RESPIRATORY:
        advisories.append(
            "Cold air combined with PM2.5 triggers bronchospasm: Always pre-warm indoor air and keep rescue inhalers within arm's reach."
        )
        advisories.append(
            "Run bedroom filtration 24/7 to clear nighttime allergen and particulate triggers."
        )
    else:
        advisories.append(
            "Even healthy adults experience reduced lung capacity in severe smog: Restrict high-intensity cardio exercises to indoor filtered spaces."
        )

    if aqi >= 300:
        advisories.append(
            "HAZARDOUS SMOG EMERGENCY: Outdoor exposure should be limited to absolute essentials. Double-seal external doors and tape perimeter window seams."
        )

    return advisories


def generate_master_smog_plan(request: PlanRequest) -> PlanResponse:
    """Orchestrates end-to-end master smog defense blueprint generation.

    Args:
        request: Validated user input request.

    Returns:
        Complete PlanResponse contract with metrics, timeline, hacks, and initiatives.
    """
    severity = calculate_smog_severity(request.current_aqi)
    impact_metrics = compute_impact_metrics(request)
    routine = generate_diurnal_routine(request)
    iaq_hacks = generate_iaq_hacks(request.diy_budget_usd)
    alternatives = generate_sustainable_alternatives(
        request.heating_type, request.commute_mode
    )
    initiatives = generate_community_initiatives(request.location_type)
    advisories = generate_personalized_advisories(
        request.vulnerability, request.current_aqi
    )

    plan_id = f"aeroshield-{uuid.uuid4().hex[:8]}"
    generated_at = datetime.now(timezone.utc).isoformat()

    summary = (
        f"Customized Smog Defense Blueprint for {request.location_name} (AQI {request.current_aqi} - {severity.value}). "
        f"Tailored for {request.household_members} household members with {request.vulnerability.value.replace('_', ' ').lower()} health tier. "
        f"By deploying targeted DIY filtration and shifting commute timing, your family can avoid {impact_metrics.pm25_exposure_avoided_ug_m3} ug/m3 "
        f"of toxic PM2.5 exposure and prevent {impact_metrics.daily_co2e_saved_kg} kg of CO2e emissions daily."
    )

    return PlanResponse(
        plan_id=plan_id,
        generated_at=generated_at,
        smog_severity=severity,
        executive_summary=summary,
        direct_impact_metrics=impact_metrics,
        hour_by_hour_routine=routine,
        indoor_air_quality_hacks=iaq_hacks,
        sustainable_alternatives=alternatives,
        community_action_initiatives=initiatives,
        personalized_advisories=advisories,
    )
