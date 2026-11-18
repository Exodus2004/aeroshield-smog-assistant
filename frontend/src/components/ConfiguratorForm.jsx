import { h } from 'preact';

export function ConfiguratorForm({ formData, onChange, onSubmit, loading }) {
  const handleChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  const getAqiColor = aqi => {
    if (aqi <= 100) return '#48bb78';
    if (aqi <= 150) return '#ecc94b';
    if (aqi <= 200) return '#ed8936';
    if (aqi <= 300) return '#e53e3e';
    return '#805ad5';
  };

  return (
    <section className="form-section" aria-labelledby="configurator-heading">
      <div className="section-title-wrap">
        <h2 id="configurator-heading" className="section-title">
          ⚙️ Household & Smog Profile Configurator
        </h2>
        <p className="section-desc">
          Tailor algorithms to your microclimate, health risk group, and daily routine.
        </p>
      </div>

      <form
        className="config-form"
        onSubmit={e => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="form-grid">
          {/* Location Name */}
          <div className="form-group">
            <label htmlFor="location_name" className="form-label">
              City / Region / District:
            </label>
            <input
              id="location_name"
              type="text"
              className="form-input"
              value={formData.location_name}
              onInput={e => handleChange('location_name', e.target.value)}
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          {/* Location Topology */}
          <div className="form-group">
            <label htmlFor="location_type" className="form-label">
              Topography / Smog Environment:
            </label>
            <select
              id="location_type"
              className="form-select"
              value={formData.location_type}
              onChange={e => handleChange('location_type', e.target.value)}
            >
              <option value="URBAN_METRO">Dense Urban Metro (Traffic & Dust)</option>
              <option value="VALLEY_INVERSION">Valley Basin (Severe Thermal Inversion Trap)</option>
              <option value="INDUSTRIAL_CORRIDOR">Industrial Corridor (Heavy Point-Source PM)</option>
              <option value="SUBURBAN_RESIDENTIAL">Suburban Residential (Woodsmoke Infiltration)</option>
            </select>
          </div>

          {/* Current Ambient AQI Slider */}
          <div className="form-group form-group-full">
            <div className="slider-header">
              <label htmlFor="current_aqi" className="form-label">
                Current Outdoor AQI: <strong style={{ color: getAqiColor(formData.current_aqi) }}>{formData.current_aqi}</strong>
              </label>
              <span className="slider-badge" style={{ backgroundColor: getAqiColor(formData.current_aqi) }}>
                {formData.current_aqi <= 100
                  ? 'Moderate'
                  : formData.current_aqi <= 150
                  ? 'Unhealthy for Sensitive'
                  : formData.current_aqi <= 200
                  ? 'Unhealthy'
                  : formData.current_aqi <= 300
                  ? 'Very Unhealthy'
                  : 'Hazardous (Severe Smog)'}
              </span>
            </div>
            <input
              id="current_aqi"
              type="range"
              className="form-slider"
              min={1}
              max={500}
              step={1}
              value={formData.current_aqi}
              onInput={e => handleChange('current_aqi', Number(e.target.value))}
            />
            <div className="slider-ticks" aria-hidden="true">
              <span>0 Good</span>
              <span>100 Mod</span>
              <span>200 Unhealthy</span>
              <span>300 Very Unhealthy</span>
              <span>500 Hazardous</span>
            </div>
          </div>

          {/* Household Members */}
          <div className="form-group">
            <label htmlFor="household_members" className="form-label">
              Household Size (Persons):
            </label>
            <input
              id="household_members"
              type="number"
              className="form-input"
              min={1}
              max={20}
              value={formData.household_members}
              onInput={e => handleChange('household_members', Number(e.target.value))}
              required
            />
          </div>

          {/* Vulnerability Tier */}
          <div className="form-group">
            <label htmlFor="vulnerability" className="form-label">
              Primary Vulnerability Tier:
            </label>
            <select
              id="vulnerability"
              className="form-select"
              value={formData.vulnerability}
              onChange={e => handleChange('vulnerability', e.target.value)}
            >
              <option value="INFANTS_AND_CHILDREN">Infants & Young Children (Developing Lungs)</option>
              <option value="ELDERLY_CARDIOVASCULAR">Elderly & Cardiovascular Patients</option>
              <option value="ASTHMA_RESPIRATORY">Asthma & Chronic Respiratory (COPD)</option>
              <option value="ACTIVE_COMMUTERS">Active Outdoor Workers & Commuters</option>
              <option value="GENERAL_HOUSEHOLD">General Healthy Household</option>
            </select>
          </div>

          {/* Heating System */}
          <div className="form-group">
            <label htmlFor="heating_type" className="form-label">
              Primary Winter Heating Source:
            </label>
            <select
              id="heating_type"
              className="form-select"
              value={formData.heating_type}
              onChange={e => handleChange('heating_type', e.target.value)}
            >
              <option value="NATURAL_GAS_FURNACE">Central Natural Gas Furnace</option>
              <option value="ELECTRIC_HEAT_PUMP">High-Efficiency Electric Heat Pump</option>
              <option value="WOOD_FIREPLACE_BIOMASS">Wood Fireplace / Biomass Stove (High Soot)</option>
              <option value="DISTRICT_RADIATOR">Municipal District Steam / Radiator</option>
              <option value="ELECTRIC_SPACE_HEATERS">Portable Electric Space Heaters</option>
            </select>
          </div>

          {/* Commute Mode */}
          <div className="form-group">
            <label htmlFor="commute_mode" className="form-label">
              Daily Transit Mode:
            </label>
            <select
              id="commute_mode"
              className="form-select"
              value={formData.commute_mode}
              onChange={e => handleChange('commute_mode', e.target.value)}
            >
              <option value="SOLO_GAS_VEHICLE">Solo Gasoline / Diesel Vehicle</option>
              <option value="CARPOOL_HYBRID_EV">Carpool or Hybrid / EV</option>
              <option value="ELECTRIC_METRO_BUS">Electric Metro / Subway / Bus</option>
              <option value="ACTIVE_CYCLING_WALK">Active Cycling / Walking</option>
              <option value="WORK_FROM_HOME">Work / Study from Home (Zero Transit)</option>
            </select>
          </div>

          {/* Daily Commute Distance Slider */}
          <div className="form-group">
            <div className="slider-header">
              <label htmlFor="daily_commute_km" className="form-label">
                Round-Trip Commute: <strong>{formData.daily_commute_km} km</strong>
              </label>
            </div>
            <input
              id="daily_commute_km"
              type="range"
              className="form-slider"
              min={0}
              max={100}
              step={1}
              value={formData.daily_commute_km}
              onInput={e => handleChange('daily_commute_km', Number(e.target.value))}
            />
          </div>

          {/* DIY Purifier Budget Slider */}
          <div className="form-group">
            <div className="slider-header">
              <label htmlFor="diy_budget_usd" className="form-label">
                DIY Air Defense Budget: <strong>${formData.diy_budget_usd}</strong>
              </label>
            </div>
            <input
              id="diy_budget_usd"
              type="range"
              className="form-slider"
              min={0}
              max={150}
              step={5}
              value={formData.diy_budget_usd}
              onInput={e => handleChange('diy_budget_usd', Number(e.target.value))}
            />
          </div>

          {/* Certified Purifier Toggle */}
          <div className="form-group form-group-checkbox">
            <label className="checkbox-label" htmlFor="has_air_purifier">
              <input
                id="has_air_purifier"
                type="checkbox"
                className="form-checkbox"
                checked={formData.has_air_purifier}
                onChange={e => handleChange('has_air_purifier', e.target.checked)}
              />
              <span>Home currently operates a certified commercial HEPA air purifier</span>
            </label>
          </div>
        </div>

        <div className="form-submit-wrap">
          <button
            type="submit"
            className="submit-plan-btn"
            disabled={loading}
            aria-label="Generate Master Smog Defense Blueprint"
          >
            {loading ? 'Synthesizing Atmospheric Data...' : '🛡️ Generate Master Smog Defense Blueprint'}
          </button>
        </div>
      </form>
    </section>
  );
}
