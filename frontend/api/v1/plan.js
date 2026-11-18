/**
 * Native Vercel Serverless Function: Smog Defense Plan Generation Endpoint
 * Path: /api/v1/plan
 */

function calculateSeverity(aqi) {
  if (aqi <= 100) return 'MODERATE';
  if (aqi <= 150) return 'UNHEALTHY_SENSITIVE';
  if (aqi <= 200) return 'UNHEALTHY';
  if (aqi <= 300) return 'VERY_UNHEALTHY';
  return 'HAZARDOUS';
}

function aqiToPm25(aqi) {
  if (aqi <= 50) return Number(((aqi / 50.0) * 12.0).toFixed(1));
  if (aqi <= 100) return Number((12.1 + ((aqi - 51) / 49.0) * (35.4 - 12.1)).toFixed(1));
  if (aqi <= 150) return Number((35.5 + ((aqi - 101) / 49.0) * (55.4 - 35.5)).toFixed(1));
  if (aqi <= 200) return Number((55.5 + ((aqi - 151) / 49.0) * (150.4 - 55.5)).toFixed(1));
  if (aqi <= 300) return Number((150.5 + ((aqi - 201) / 99.0) * (250.4 - 150.5)).toFixed(1));
  return Number((250.5 + ((aqi - 301) / 199.0) * (500.0 - 250.5)).toFixed(1));
}

function pm25ToAqi(pm25) {
  if (pm25 <= 12.0) return Math.max(1, Math.round((pm25 / 12.0) * 50.0));
  if (pm25 <= 35.4) return Math.round(51 + ((pm25 - 12.1) / (35.4 - 12.1)) * 49.0);
  if (pm25 <= 55.4) return Math.round(101 + ((pm25 - 35.5) / (55.4 - 35.5)) * 49.0);
  if (pm25 <= 150.4) return Math.round(151 + ((pm25 - 55.5) / (150.4 - 55.5)) * 49.0);
  if (pm25 <= 250.4) return Math.round(201 + ((pm25 - 150.5) / (250.4 - 150.5)) * 99.0);
  return Math.min(500, Math.round(301 + ((pm25 - 250.5) / (500.0 - 250.5)) * 199.0));
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const body = req.body || {};
  const location_name = body.location_name || 'Urban Metro';
  const location_type = body.location_type || 'URBAN_METRO';
  const current_aqi = Number(body.current_aqi) || 250;
  const household_members = Number(body.household_members) || 3;
  const vulnerability = body.vulnerability || 'INFANTS_AND_CHILDREN';
  const heating_type = body.heating_type || 'NATURAL_GAS_FURNACE';
  const daily_commute_km = Number(body.daily_commute_km) || 20.0;
  const commute_mode = body.commute_mode || 'SOLO_GAS_VEHICLE';
  const has_air_purifier = Boolean(body.has_air_purifier);
  const diy_budget_usd = Number(body.diy_budget_usd) || 45.0;

  const severity = calculateSeverity(current_aqi);
  const outdoor_pm25 = aqiToPm25(current_aqi);
  const unfiltered_indoor_pm25 = outdoor_pm25 * 0.55;

  let filtration_efficiency = 0.35;
  if (has_air_purifier) {
    filtration_efficiency = 0.90;
  } else if (diy_budget_usd >= 30.0) {
    filtration_efficiency = 0.82;
  }

  const target_indoor_pm25 = Math.max(5.0, outdoor_pm25 * (1.0 - filtration_efficiency));
  const pm25_avoided = Math.max(0.0, unfiltered_indoor_pm25 - target_indoor_pm25);
  const indoor_aqi_projected = pm25ToAqi(target_indoor_pm25);

  let commute_factor = 0.0;
  if (commute_mode === 'SOLO_GAS_VEHICLE') commute_factor = 0.70;
  else if (commute_mode === 'CARPOOL_HYBRID_EV') commute_factor = 0.35;
  else if (commute_mode === 'ELECTRIC_METRO_BUS') commute_factor = 0.15;

  const daily_commute_saved_co2e = daily_commute_km * 0.171 * commute_factor;
  let heating_saved_co2e = 1.8;
  if (heating_type === 'WOOD_FIREPLACE_BIOMASS') heating_saved_co2e = 4.2;

  const total_daily_co2e_saved = Number((daily_commute_saved_co2e + heating_saved_co2e).toFixed(2));
  const estimated_monthly_savings_usd = diy_budget_usd >= 30.0 ? 58.0 : 35.0;
  const health_risk_reduction_pct = Number(Math.min(92.0, Math.max(25.0, filtration_efficiency * 100.0)).toFixed(1));

  const plan_id = `aeroshield-${Math.random().toString(36).substring(2, 10)}`;
  const generated_at = new Date().toISOString();

  const routine = [
    {
      time_slot: '06:00 - 09:00',
      window_status: 'SEALED_SHUT',
      activity_recommendation: 'Morning thermal inversion peak. Keep all windows sealed. Conduct indoor workouts; cancel outdoor jogs.',
      emission_guidance: "Avoid cold-engine car idling. If driving, set HVAC strictly to 'Cabin Recirculation'. Avoid wood stove ignition.",
      health_alert: `High risk for ${vulnerability.replace(/_/g, ' ').toLowerCase()}. Take preventive prescribed inhalers 15 minutes before waking activities.`,
    },
    {
      time_slot: '09:00 - 12:00',
      window_status: 'SEALED_SHUT',
      activity_recommendation: 'Deep work / school hours. Run indoor DIY Corsi-Rosenthal boxes or HEPA filtration on medium-high speed in occupied rooms.',
      emission_guidance: 'Batch household electrical appliances during mid-morning off-peak solar hours where possible.',
      health_alert: 'Particulate concentration remains severe at street level. Wear well-fitted N95/FFP2 masks for any essential outdoor transit.',
    },
    {
      time_slot: '12:00 - 15:00',
      window_status: 'CONTROLLED_FLUSH',
      activity_recommendation: 'Solar heating mixes the lower atmospheric boundary layer, causing temporary dispersion. Best safe window for essential outdoor tasks.',
      emission_guidance: 'Consolidate errands into a single combined multi-stop trip to avoid multiple cold-engine vehicle starts.',
      health_alert: 'Check live sensor readings. If local AQI drops below 150, perform a brief 10-minute cross-ventilation air exchange, then reseal.',
    },
    {
      time_slot: '15:00 - 18:00',
      window_status: 'RESTRICTED',
      activity_recommendation: 'School run & evening commute prep. Utilize neighborhood carpools, electric metro, or protected transit corridors.',
      emission_guidance: 'Zero idling in school pickup zones. Advocate for car-free pedestrian buffer zones within 200m of schools.',
      health_alert: 'Vulnerable family members should return indoors before sunset. Reseal all external doors and draft seals.',
    },
    {
      time_slot: '18:00 - 21:00',
      window_status: 'SEALED_SHUT',
      activity_recommendation: 'Evening dinner & relaxation. Use ducted kitchen range hoods while cooking; avoid pan-frying or open grilling which spikes indoor PM2.5.',
      emission_guidance: 'Switch to clean electric heating or low-temperature radiant heat; do not ignite decorative fireplaces or biomass burners.',
      health_alert: 'Run air filtration in living areas. Hydrate and use saline nasal rinses to clear upper airway particulate matter.',
    },
    {
      time_slot: '21:00 - 06:00',
      window_status: 'SEALED_SHUT',
      activity_recommendation: 'Overnight sleep protection. Relocate air purifier directly into the primary bedroom; run on continuous low/whisper mode.',
      emission_guidance: 'Lower central heating thermostat by 2°C (3.6°F) and use insulating thermal blankets to curb nighttime furnace emissions.',
      health_alert: 'Maintain bedroom humidity between 40%-50% to prevent mucosal drying and enhance respiratory cilia filtration.',
    },
  ];

  const iaq_hacks = [
    {
      title: 'DIY Corsi-Rosenthal Box Air Cleaner',
      category: 'Filtration Engineering',
      cost_usd: 32.0,
      pm25_reduction_pct: 85.0,
      materials_needed: [
        'One 20x20-inch Box Fan ($18)',
        'Four MERV-13 Furnace Filters ($12 total)',
        'Duct tape or painter\'s tape ($2)',
        'Cardboard bottom shroud',
      ],
      step_by_step_instructions: [
        'Form an open cube using the 4 MERV-13 filters, with arrows pointing inward toward the center.',
        'Tape the edges of the 4 filters securely to create an airtight square frame.',
        'Cut a cardboard square to seal the bottom opening and tape tightly.',
        'Place the 20-inch box fan on top, blowing upward (away from the cube), and tape the seam.',
        'Power on at speed 1 or 2 for high-volume, low-noise particulate filtration exceeding $300 commercial units.',
      ],
      scientific_rationale: 'Tested by UC Davis and EPA: Corsi-Rosenthal boxes achieve Clean Air Delivery Rates (CADR) of 200-250 CFM for PM2.5 at less than 15% the cost of HEPA appliances.',
    },
    {
      title: 'Positive-Pressure Clean Zone Protocol',
      category: 'Ventilation & Sealing',
      cost_usd: 8.5,
      pm25_reduction_pct: 60.0,
      materials_needed: [
        'Weatherstripping foam tape ($5)',
        'Under-door draft stopper or rolled damp towel ($3.5)',
      ],
      step_by_step_instructions: [
        'Designate the primary bedroom as the designated "Clean Air Sanctuary".',
        'Apply foam weatherstripping along window frames to block smog infiltration gaps.',
        'Place an under-door draft stopper to prevent dirty hallway air from entering.',
        'Run an air cleaner continuously in this single sealed room to create a low-particulate haven.',
      ],
      scientific_rationale: 'Concentrating filtration capacity in a single well-sealed room achieves indoor PM2.5 reductions of 60-80% even when the rest of the dwelling remains unsealed.',
    },
    {
      title: 'Cooking Emission Suppression Protocol',
      category: 'Source Control',
      cost_usd: 0.0,
      pm25_reduction_pct: 45.0,
      materials_needed: [
        'Existing kitchen exhaust hood',
        'Cookware lids',
      ],
      step_by_step_instructions: [
        'Always cook on the back burners where exhaust hood suction is 2.5x more efficient.',
        'Turn the range hood to high 2 minutes BEFORE igniting burners, establishing an active air draft.',
        'Keep pots and pans covered with lids to prevent aerosolized oils and particulate release.',
        'Leave the exhaust fan running for 10 minutes post-cooking, keeping kitchen doors closed to living areas.',
      ],
      scientific_rationale: 'Indoor cooking (especially frying) creates transient PM2.5 spikes exceeding 300 ug/m3. Back-burner usage with pre-draft suction captures up to 75% of cooking aerosols at source.',
    },
    {
      title: 'Electrostatic Pre-Filter Fan Retrofit',
      category: 'Filtration Engineering',
      cost_usd: 14.0,
      pm25_reduction_pct: 50.0,
      materials_needed: [
        'Single MERV-11 or MERV-13 20x20 filter ($9)',
        'Bungee cord or painter\'s tape ($5)',
        'Standard household box fan',
      ],
      step_by_step_instructions: [
        'Fasten a single MERV-13 filter directly to the intake (back) side of your box fan.',
        'Ensure arrow points toward the fan blades (direction of airflow).',
        'Secure with two criss-crossed bungee cords or perimeter tape.',
        'Run in occupied spaces for rapid budget particulate reduction.',
      ],
      scientific_rationale: 'Provides immediate 50% single-pass PM2.5 reduction with minimal static pressure drop, ideal for budget-constrained apartments.',
    },
  ];

  const alternatives = [
    {
      domain: 'Mobility & Commuting',
      current_practice: 'Solo gasoline vehicle commute during morning inversion hours.',
      sustainable_switch: 'Switch to electric bus, metro transit, or 3-person neighborhood carpooling clusters.',
      carbon_saving_desc: 'Prevents ~3.8 kg CO2e and eliminates direct toxic NOx exhaust at street level daily.',
      community_benefit: 'Reduces vehicle cold-start emissions by 66% during the most dangerous morning temperature inversions.',
    },
    {
      domain: 'Household Space Heating',
      current_practice: 'Continuous high-temperature gas furnace or wood-burning stove heating.',
      sustainable_switch: 'Pair smart programmable thermostat set to 19°C (66°F) with high-efficiency heat pump and radiant heat zoning.',
      carbon_saving_desc: 'Saves 350-600 kg CO2e per winter season and reduces local particulate soot to absolute zero.',
      community_benefit: 'Eliminates ground-level chimney smoke plumes that settle into neighboring valley air basins.',
    },
    {
      domain: 'Community Yard Waste Management',
      current_practice: 'Open-air burning of dry autumn leaves, garden debris, or organic crop biomass.',
      sustainable_switch: 'Community centralized microbial composting and anaerobic municipal soil mulching.',
      carbon_saving_desc: 'Avoids 1,200 kg CO2e and prevents massive localized spikes of benzo[a]pyrene carcinogens.',
      community_benefit: 'Prevents dense ground-level smoke haze blankets from accumulating in residential streets.',
    },
    {
      domain: 'Indoor Air Conditioning & Ventilation',
      current_practice: 'Unfiltered natural draft ventilation during peak afternoon traffic hours.',
      sustainable_switch: 'Smart scheduled ventilation timed to midday solar convection mixing windows.',
      carbon_saving_desc: 'Reduces HVAC fan strain and saves ~1.2 kWh electricity daily.',
      community_benefit: 'Optimizes clean indoor zones without overloading the neighborhood power grid during winter evenings.',
    },
  ];

  const initiatives = [
    {
      initiative_name: 'Clean Air School Streets & Idling Free Buffer Zones',
      action_items: [
        'Establish a mandatory 250-meter vehicle-free drop-off perimeter around local schools during 07:30-08:30.',
        'Enact strict engine anti-idling rules for school buses and parent pickup vehicles.',
        'Install a real-time hyper-local community AQI display at the school gate.',
      ],
      neighborhood_impact: 'Reduces children\'s acute particulate exposure during arrival by up to 40% during inversion peaks.',
    },
    {
      initiative_name: 'Neighborhood Corsi-Rosenthal Box Assembly Cooperative',
      action_items: [
        'Bulk-purchase box fans and MERV-13 filters at wholesale trade discounts (saving 35%).',
        'Host a weekend community workshop to build 50+ DIY air cleaners for vulnerable elderly and families.',
        'Distribute completed units to community centers, public clinics, and low-income residences.',
      ],
      neighborhood_impact: 'Establishes community-wide resilience and ensures clean air equity for vulnerable residents.',
    },
    {
      initiative_name: 'Hyper-Local Community Air Sensor Network',
      action_items: [
        'Deploy 5 low-cost open-source particulate monitors (e.g., PurpleAir / AirGradient) across the neighborhood.',
        'Link data to a free community dashboard showing street-by-street microclimate air quality variations.',
        'Provide early warning alerts before evening temperature inversions trap surface smoke.',
      ],
      neighborhood_impact: 'Empowers families to coordinate outdoor activities and ventilation based on empirical street-level data.',
    },
  ];

  const advisories = [
    'Fine particulates (PM2.5) penetrate deep into lung tissue: Maintain continuous indoor air filtration in primary living and sleeping rooms.',
    'Seal drafty door thresholds and perimeter window gaps with foam tape or rolled towels to prevent outdoor smoke infiltration.',
  ];
  if (current_aqi >= 300) {
    advisories.push('HAZARDOUS SMOG EMERGENCY: Outdoor exposure should be restricted to absolute essentials. Wear snug N95/FFP2 respirators when stepping outdoors.');
  }

  const executive_summary = `Customized Smog Defense Blueprint for ${location_name} (AQI ${current_aqi} - ${severity}). Tailored for ${household_members} household members with ${vulnerability.replace(/_/g, ' ').toLowerCase()} health tier. By deploying targeted DIY filtration and shifting commute timing, your family can avoid ${pm25_avoided.toFixed(1)} ug/m3 of toxic PM2.5 exposure and prevent ${total_daily_co2e_saved} kg of CO2e emissions daily.`;

  return res.status(200).json({
    plan_id,
    generated_at,
    smog_severity: severity,
    executive_summary,
    direct_impact_metrics: {
      pm25_exposure_avoided_ug_m3: Number(pm25_avoided.toFixed(1)),
      daily_co2e_saved_kg: total_daily_co2e_saved,
      indoor_aqi_projected,
      estimated_monthly_savings_usd,
      health_risk_reduction_pct,
    },
    hour_by_hour_routine: routine,
    indoor_air_quality_hacks: iaq_hacks,
    sustainable_alternatives: alternatives,
    community_action_initiatives: initiatives,
    personalized_advisories: advisories,
  });
}
