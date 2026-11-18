import { h } from 'preact';

export function SustainableAlternatives({ alternatives }) {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div className="tab-pane" role="tabpanel" id="pane-alternatives" aria-labelledby="tab-alternatives">
      <div className="section-title-wrap">
        <h3 className="pane-title">🌿 Sustainable Alternatives & Lifestyle Switches</h3>
        <p className="section-desc">
          Replace high-emission winter practices with clean, high-impact community alternatives that reduce ambient smog and carbon footprints.
        </p>
      </div>

      <div className="alternatives-grid">
        {alternatives.map((alt, idx) => (
          <div key={idx} className="alt-card">
            <div className="alt-domain-badge">{alt.domain}</div>

            <div className="alt-comparison-grid">
              <div className="alt-side alt-old">
                <span className="side-label">❌ Common High-Emission Habit</span>
                <p className="side-text">{alt.current_practice}</p>
              </div>

              <div className="alt-divider" aria-hidden="true">
                ➔
              </div>

              <div className="alt-side alt-new">
                <span className="side-label">✅ Sustainable Clean Switch</span>
                <p className="side-text">{alt.sustainable_switch}</p>
              </div>
            </div>

            <div className="alt-impact-footer">
              <div className="impact-pill">
                <strong>🌍 Carbon Impact:</strong> {alt.carbon_saving_desc}
              </div>
              <div className="impact-pill">
                <strong>🏘️ Neighborhood Health:</strong> {alt.community_benefit}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
