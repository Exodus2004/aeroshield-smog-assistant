import { h } from 'preact';

export function ImpactMetricsCard({ metrics, outdoorAqi }) {
  if (!metrics) return null;

  return (
    <section className="impact-section" aria-labelledby="impact-heading">
      <div className="section-title-wrap">
        <h2 id="impact-heading" className="section-title">
          📊 Direct Environmental & Health Impact Telemetry
        </h2>
        <p className="section-desc">
          Quantified outcome measurements resulting from targeted daily routine shifts and DIY indoor air purification.
        </p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon" aria-hidden="true">
            🫁
          </div>
          <div className="metric-content">
            <span className="metric-value">{metrics.pm25_exposure_avoided_ug_m3} µg/m³</span>
            <span className="metric-label">Indoor PM2.5 Avoided</span>
            <span className="metric-subtext">Estimated mass particulate reduction per cubic meter</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" aria-hidden="true">
            🌱
          </div>
          <div className="metric-content">
            <span className="metric-value">{metrics.daily_co2e_saved_kg} kg/day</span>
            <span className="metric-label">CO2e Emissions Prevented</span>
            <span className="metric-subtext">From transit mode shift & heating efficiency</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" aria-hidden="true">
            🏠
          </div>
          <div className="metric-content">
            <span className="metric-value">
              AQI {metrics.indoor_aqi_projected}{' '}
              <span className="metric-delta">
                (vs {outdoorAqi} Out)
              </span>
            </span>
            <span className="metric-label">Projected Indoor Air Quality</span>
            <span className="metric-subtext">
              Clean air sanctuary envelope status
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" aria-hidden="true">
            💵
          </div>
          <div className="metric-content">
            <span className="metric-value">${metrics.estimated_monthly_savings_usd}/mo</span>
            <span className="metric-label">Monthly Cost Savings</span>
            <span className="metric-subtext">DIY engineering vs $300 commercial HEPA filters</span>
          </div>
        </div>

        <div className="metric-card metric-card-highlight">
          <div className="metric-icon" aria-hidden="true">
            🛡️
          </div>
          <div className="metric-content">
            <span className="metric-value">-{metrics.health_risk_reduction_pct}%</span>
            <span className="metric-label">Acute Health Risk Drop</span>
            <span className="metric-subtext">Reduced pulmonary inflammation & deep alveolar deposition</span>
          </div>
        </div>
      </div>
    </section>
  );
}
