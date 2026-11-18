import { h } from 'preact';

export function RoutineTimeline({ routine }) {
  if (!routine || routine.length === 0) return null;

  const getStatusBadge = status => {
    switch (status) {
      case 'SEALED_SHUT':
        return {
          label: '🔒 SEAL WINDOWS TIGHT',
          className: 'badge-sealed',
        };
      case 'CONTROLLED_FLUSH':
        return {
          label: '💨 SAFE FLUSH WINDOW (10 MIN)',
          className: 'badge-flush',
        };
      case 'RESTRICTED':
        return {
          label: '⚠️ RESTRICTED EXPOSURE',
          className: 'badge-restricted',
        };
      default:
        return {
          label: status,
          className: 'badge-neutral',
        };
    }
  };

  return (
    <div className="tab-pane" role="tabpanel" id="pane-routine" aria-labelledby="tab-routine">
      <div className="section-title-wrap">
        <h3 className="pane-title">🕒 24-Hour Diurnal Smog Run-of-Day Timeline</h3>
        <p className="section-desc">
          Thermal inversions dynamically alter outdoor particle concentration throughout the day. Follow this operational schedule to minimize exposure and personal emissions.
        </p>
      </div>

      <div className="timeline-container">
        {routine.map((item, index) => {
          const badge = getStatusBadge(item.window_status);
          return (
            <div key={index} className="timeline-node">
              <div className="timeline-time-col">
                <span className="time-display">{item.time_slot}</span>
                <span className={`status-pill ${badge.className}`}>{badge.label}</span>
              </div>

              <div className="timeline-body-col">
                <div className="routine-block">
                  <h4 className="routine-heading">🏃 Safe Activity & Lifestyle Guidance:</h4>
                  <p className="routine-text">{item.activity_recommendation}</p>
                </div>

                <div className="routine-block">
                  <h4 className="routine-heading">🚗 Low-Emission Transit & Heating:</h4>
                  <p className="routine-text">{item.emission_guidance}</p>
                </div>

                <div className="routine-alert-block">
                  <span className="alert-icon" aria-hidden="true">
                    ⚕️
                  </span>
                  <p className="alert-text">
                    <strong>Medical Precaution:</strong> {item.health_alert}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
