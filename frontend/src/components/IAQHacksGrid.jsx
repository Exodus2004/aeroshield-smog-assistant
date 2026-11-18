import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

export function IAQHacksGrid({ hacks }) {
  if (!hacks || hacks.length === 0) return null;

  const [completedSteps, setCompletedSteps] = useState(() => {
    try {
      const saved = localStorage.getItem('aeroshield_checklist');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleStep = (hackIndex, stepIndex) => {
    const key = `${hackIndex}-${stepIndex}`;
    const nextState = { ...completedSteps, [key]: !completedSteps[key] };
    setCompletedSteps(nextState);
    try {
      localStorage.setItem('aeroshield_checklist', JSON.stringify(nextState));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  };

  return (
    <div className="tab-pane" role="tabpanel" id="pane-iaq" aria-labelledby="tab-iaq">
      <div className="section-title-wrap">
        <h3 className="pane-title">🛠️ Indoor Air Quality (IAQ) Engineering Hacks</h3>
        <p className="section-desc">
          High-performance, scientifically validated DIY particulate filtration and source-control methods costing a fraction of commercial units.
        </p>
      </div>

      <div className="hacks-grid">
        {hacks.map((hack, hIdx) => (
          <div key={hIdx} className="hack-card">
            <div className="hack-header">
              <span className="hack-category">{hack.category}</span>
              <div className="hack-badges">
                <span className="badge-cost">Estimated Cost: ${hack.cost_usd}</span>
                <span className="badge-efficiency">⚡ {hack.pm25_reduction_pct}% PM2.5 Reduction</span>
              </div>
            </div>

            <h4 className="hack-title">{hack.title}</h4>

            <div className="hack-section">
              <h5 className="hack-subtitle">📦 Required Materials:</h5>
              <ul className="materials-list">
                {hack.materials_needed.map((mat, mIdx) => (
                  <li key={mIdx}>{mat}</li>
                ))}
              </ul>
            </div>

            <div className="hack-section">
              <h5 className="hack-subtitle">📋 Step-by-Step Interactive Checklist:</h5>
              <div className="checklist-items">
                {hack.step_by_step_instructions.map((step, sIdx) => {
                  const isChecked = !!completedSteps[`${hIdx}-${sIdx}`];
                  return (
                    <label
                      key={sIdx}
                      className={`checklist-item ${isChecked ? 'item-completed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleStep(hIdx, sIdx)}
                      />
                      <span>{step}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="hack-rationale">
              <span className="rationale-icon" aria-hidden="true">
                🔬
              </span>
              <p className="rationale-text">
                <strong>Scientific Validation:</strong> {hack.scientific_rationale}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
