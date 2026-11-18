import { h } from 'preact';

export function Header({ highContrast, onToggleHighContrast, currentAqi, severity }) {
  const getBadgeClass = aqi => {
    if (aqi <= 100) return 'badge-moderate';
    if (aqi <= 150) return 'badge-sensitive';
    if (aqi <= 200) return 'badge-unhealthy';
    if (aqi <= 300) return 'badge-very-unhealthy';
    return 'badge-hazardous';
  };

  return (
    <header className="app-header" role="banner">
      <div className="header-container">
        <div className="header-brand">
          <div className="logo-shield" aria-hidden="true">
            🛡️
          </div>
          <div>
            <h1 className="header-title">AeroShield AI</h1>
            <p className="header-subtitle">
              Winter Smog & Urban Air Pollution Family Defense Platform
            </p>
          </div>
        </div>

        <div className="header-actions">
          <div
            className={`aqi-beacon ${getBadgeClass(currentAqi)}`}
            role="status"
            aria-live="polite"
          >
            <span className="beacon-dot" aria-hidden="true"></span>
            <span>
              Live Smog Index: <strong>AQI {currentAqi}</strong> ({severity.replace(/_/g, ' ')})
            </span>
          </div>

          <button
            type="button"
            className="toggle-contrast-btn"
            onClick={onToggleHighContrast}
            aria-pressed={highContrast}
            aria-label="Toggle high contrast accessibility mode"
          >
            {highContrast ? '☀️ Normal Contrast' : '👁️ High Contrast'}
          </button>
        </div>
      </div>
    </header>
  );
}
