import { h } from 'preact';

export function CommunityInitiatives({ initiatives }) {
  if (!initiatives || initiatives.length === 0) return null;

  return (
    <div className="tab-pane" role="tabpanel" id="pane-community" aria-labelledby="tab-community">
      <div className="section-title-wrap">
        <h3 className="pane-title">🤝 Community-Scale Smog Action Initiatives</h3>
        <p className="section-desc">
          Individual filtration protects homes, but community-scale collective action drives down neighborhood smog levels and protects vulnerable neighbors.
        </p>
      </div>

      <div className="initiatives-grid">
        {initiatives.map((item, idx) => (
          <div key={idx} className="initiative-card">
            <div className="initiative-header">
              <span className="initiative-icon" aria-hidden="true">
                📢
              </span>
              <h4 className="initiative-title">{item.initiative_name}</h4>
            </div>

            <div className="action-items-wrap">
              <h5 className="action-items-title">🚀 Neighborhood Execution Steps:</h5>
              <ol className="action-items-list">
                {item.action_items.map((step, sIdx) => (
                  <li key={sIdx}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="initiative-impact">
              <strong>🎯 Expected Community Benefit:</strong> {item.neighborhood_impact}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
