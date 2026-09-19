import { useVehicleStore } from '@/state/vehicleStore'
import './mobile.css'

const STATUS_CLASS: Record<string, string> = {
  INFO: 'rd-m-status-unknown',
  ADVISORY: 'rd-m-status-observe',
  WARNING: 'rd-m-status-warning',
  CRITICAL: 'rd-m-status-critical',
}

export function DiagnosticsScreen({ onOpenDtc }: { onOpenDtc: (code: string) => void }) {
  const dtcs = useVehicleStore((s) => s.dtcs)
  const active = dtcs.filter((d) => d.status === 'ACTIVE')
  const historical = dtcs.filter((d) => d.status !== 'ACTIVE')

  return (
    <div>
      <div className="rd-m-section-label">ACTIVE</div>
      {active.length === 0 ? (
        <div className="rd-m-empty">NO ACTIVE FAULTS</div>
      ) : (
        <div className="rd-m-card">
          {active.map((d) => (
            <div className="rd-m-row clickable" key={d.code} onClick={() => onOpenDtc(d.code)}>
              <div>
                <div className="rd-m-row-label" style={{ fontWeight: 700 }}>{d.code}</div>
                <div style={{ fontSize: 12, color: '#6c786f', marginTop: 2 }}>{d.description}</div>
              </div>
              <span className={`rd-m-status-chip ${STATUS_CLASS[d.severity]}`}>{d.severity}</span>
            </div>
          ))}
        </div>
      )}

      <div className="rd-m-section-label">HISTORICAL / STORED</div>
      {historical.length === 0 ? (
        <div className="rd-m-empty">NO STORED CODES</div>
      ) : (
        <div className="rd-m-card">
          {historical.map((d) => (
            <div className="rd-m-row clickable" key={d.code} onClick={() => onOpenDtc(d.code)}>
              <div>
                <div className="rd-m-row-label" style={{ fontWeight: 700 }}>{d.code}</div>
                <div style={{ fontSize: 12, color: '#6c786f', marginTop: 2 }}>{d.description}</div>
              </div>
              <span className="rd-m-status-chip rd-m-status-unknown">{d.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
