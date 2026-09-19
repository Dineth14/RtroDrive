import { useVehicleStore } from '@/state/vehicleStore'
import './WarningOverlay.css'

const SEVERITY_COLOR: Record<string, string> = {
  INFO: 'var(--cl-muted-text)',
  ADVISORY: 'var(--cl-amber)',
  WARNING: 'var(--cl-warning-amber)',
  CRITICAL: 'var(--cl-critical-red)',
}

export function WarningOverlay() {
  const warnings = useVehicleStore((s) => s.warnings)
  const acknowledgeWarning = useVehicleStore((s) => s.acknowledgeWarning)

  const blocking = warnings.filter((w) => (w.severity === 'WARNING' || w.severity === 'CRITICAL') && !w.acknowledged)
  const primary = blocking.find((w) => w.severity === 'CRITICAL') ?? blocking[0]

  const banners = warnings.filter((w) => w.id !== primary?.id)

  return (
    <>
      {primary && (
        <div className={`rd-warn-box${primary.severity === 'CRITICAL' ? ' critical' : ''}`}>
          <div className="rd-warn-title">{primary.title}</div>
          {primary.value && <div className="rd-warn-value tabular-num">{primary.value}</div>}
          <div className="rd-warn-detail">{primary.detail}</div>
          <button className="rd-warn-ack" onClick={() => acknowledgeWarning(primary.id)}>
            ACKNOWLEDGE
          </button>
        </div>
      )}
      {banners.length > 0 && (
        <div className="rd-warn-banners">
          {banners.slice(0, 4).map((w) => (
            <div key={w.id} className="rd-warn-banner" style={{ color: SEVERITY_COLOR[w.severity] }}>
              {w.title}
              {w.value ? ` ${w.value}` : ''}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
