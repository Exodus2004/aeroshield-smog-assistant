import { h } from 'preact';

export function PrintExportModal({ plan, onClose }) {
  if (!plan) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(plan, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AeroShield_Smog_Plan_${plan.plan_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    const md = `# AeroShield AI: Winter Smog Defense Blueprint
**Plan ID:** ${plan.plan_id}  
**Generated At:** ${plan.generated_at}  
**Smog Severity:** ${plan.smog_severity}  

---

### Executive Summary
${plan.executive_summary}

---

### Direct Impact Telemetry
- **PM2.5 Avoided:** ${plan.direct_impact_metrics.pm25_exposure_avoided_ug_m3} µg/m³
- **Daily CO2e Saved:** ${plan.direct_impact_metrics.daily_co2e_saved_kg} kg
- **Projected Indoor AQI:** ${plan.direct_impact_metrics.indoor_aqi_projected}
- **Monthly Savings:** $${plan.direct_impact_metrics.estimated_monthly_savings_usd}
- **Health Risk Reduction:** -${plan.direct_impact_metrics.health_risk_reduction_pct}%

---

### 24-Hour Diurnal Routine
${plan.hour_by_hour_routine
  .map(
    r =>
      `#### ${r.time_slot} [${r.window_status}]\n- **Activity:** ${r.activity_recommendation}\n- **Transit/Heating:** ${r.emission_guidance}\n- **Medical:** ${r.health_alert}\n`
  )
  .join('\n')}

---

### Indoor Air Quality (IAQ) Hacks
${plan.indoor_air_quality_hacks
  .map(
    h =>
      `#### ${h.title} (Cost: $${h.cost_usd} | PM2.5 Drop: ${h.pm25_reduction_pct}%)\n**Materials:** ${h.materials_needed.join(
        ', '
      )}\n**Instructions:**\n${h.step_by_step_instructions.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n`
  )
  .join('\n')}
`;

    navigator.clipboard.writeText(md).then(() => {
      alert('Markdown blueprint copied to clipboard!');
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="modal-title" className="modal-title">
            📄 Print & Export Master Blueprint
          </h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close export dialog">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-text">
            Export your customized winter smog defense protocol for household display, classroom distribution, or offline emergency reference.
          </p>

          <div className="export-actions-grid">
            <button type="button" className="export-card-btn" onClick={handlePrint}>
              <span className="export-icon" aria-hidden="true">
                🖨️
              </span>
              <strong>Print / Save as PDF</strong>
              <small>Optimized clean multi-page document layout</small>
            </button>

            <button type="button" className="export-card-btn" onClick={handleCopyMarkdown}>
              <span className="export-icon" aria-hidden="true">
                📋
              </span>
              <strong>Copy Markdown</strong>
              <small>Copy formatted text to clipboard</small>
            </button>

            <button type="button" className="export-card-btn" onClick={handleDownloadJson}>
              <span className="export-icon" aria-hidden="true">
                💾
              </span>
              <strong>Download JSON Schema</strong>
              <small>Export full machine-readable telemetry data</small>
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
