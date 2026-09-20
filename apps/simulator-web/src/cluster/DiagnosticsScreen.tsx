import { useVehicleStore } from '@/state/vehicleStore'
import './DiagnosticsScreen.css'

export function DiagnosticsScreen() {
  const dtcs = useVehicleStore((s) => s.dtcs).filter((d) => d.status === 'ACTIVE' || d.status === 'STORED')

  return (
    <div className="rd-screen">
      <div className="rd-diag">
        <div className="rd-section-title" style={{ marginTop: 8 }}>
          ENGINE CHECK
        </div>
        {dtcs.length === 0 ? (
          <div className="rd-diag-empty">NO ACTIVE FAULTS</div>
        ) : (
          <div className="rd-diag-list">
            {dtcs.map((dtc) => (
              <div key={dtc.code} className={`rd-diag-card ${dtc.severity.toLowerCase()}`}>
                <div
                  className="rd-diag-code"
                  style={{ color: dtc.severity === 'CRITICAL' ? 'var(--cl-critical-red)' : dtc.severity === 'WARNING' ? 'var(--cl-warning-amber)' : 'var(--cl-primary)' }}
                >
                  {dtc.code}
                </div>
                <div className="rd-diag-desc">
                  <div className="rd-diag-desc-title">{dtc.description}</div>
                  <div className="rd-diag-evidence">
                    {dtc.evidence.slice(0, 2).map((e) => (
                      <span key={e.label}>
                        {e.label}: {e.value}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rd-diag-side">
                  <span
                    className="rd-diag-severity"
                    style={{ color: dtc.severity === 'CRITICAL' ? 'var(--cl-critical-red)' : dtc.severity === 'WARNING' ? 'var(--cl-warning-amber)' : 'var(--cl-muted-text)' }}
                  >
                    {dtc.severity} · {dtc.status}
                  </span>
                  <span className="rd-diag-phone-hint">VIEW DETAILS ON PHONE</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
