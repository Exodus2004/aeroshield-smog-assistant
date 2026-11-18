import { h } from 'preact';

export function PresetsSection({ onSelectPreset }) {
  const presets = [
    {
      id: 'delhi',
      icon: '🏙️',
      name: 'Delhi-NCR Metro Family',
      tag: 'AQI 420 · Severe Smog Alert',
      desc: 'High-rise apartment with toddler and elderly COPD grandparent.',
      data: {
        location_name: 'Delhi-NCR Metro',
        location_type: 'URBAN_METRO',
        current_aqi: 420,
        household_members: 4,
        vulnerability: 'INFANTS_AND_CHILDREN',
        heating_type: 'ELECTRIC_SPACE_HEATERS',
        daily_commute_km: 26.0,
        commute_mode: 'SOLO_GAS_VEHICLE',
        has_air_purifier: false,
        diy_budget_usd: 40.0,
      },
    },
    {
      id: 'saltlake',
      icon: '🏔️',
      name: 'Salt Lake Valley Commuter',
      tag: 'AQI 195 · Winter Thermal Inversion',
      desc: 'Suburban valley townhouse with daily highway commute and asthmatic runner.',
      data: {
        location_name: 'Salt Lake Valley Basin',
        location_type: 'VALLEY_INVERSION',
        current_aqi: 195,
        household_members: 2,
        vulnerability: 'ASTHMA_RESPIRATORY',
        heating_type: 'NATURAL_GAS_FURNACE',
        daily_commute_km: 35.0,
        commute_mode: 'CARPOOL_HYBRID_EV',
        has_air_purifier: true,
        diy_budget_usd: 65.0,
      },
    },
    {
      id: 'school',
      icon: '🏫',
      name: 'Greenwood Community School',
      tag: 'AQI 260 · Industrial Corridor Hub',
      desc: 'Neighborhood primary school and community safe-haven serving 450 students.',
      data: {
        location_name: 'Greenwood Industrial District',
        location_type: 'INDUSTRIAL_CORRIDOR',
        current_aqi: 260,
        household_members: 12,
        vulnerability: 'INFANTS_AND_CHILDREN',
        heating_type: 'DISTRICT_RADIATOR',
        daily_commute_km: 15.0,
        commute_mode: 'ELECTRIC_METRO_BUS',
        has_air_purifier: false,
        diy_budget_usd: 120.0,
      },
    },
  ];

  return (
    <section className="presets-section" aria-labelledby="presets-heading">
      <div className="section-title-wrap">
        <h2 id="presets-heading" className="section-title">
          ⚡ 1-Click Quick Scenario Presets
        </h2>
        <p className="section-desc">
          Instantly simulate real-world winter smog crises across diverse geographical and family profiles.
        </p>
      </div>

      <div className="presets-grid">
        {presets.map(p => (
          <button
            key={p.id}
            type="button"
            className="preset-card"
            onClick={() => onSelectPreset(p.data)}
            aria-label={`Load preset for ${p.name}`}
          >
            <div className="preset-top">
              <span className="preset-icon" aria-hidden="true">
                {p.icon}
              </span>
              <span className="preset-tag">{p.tag}</span>
            </div>
            <h3 className="preset-name">{p.name}</h3>
            <p className="preset-desc">{p.desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
