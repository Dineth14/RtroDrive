import { useState } from 'react'
import { useVehicleStore } from '@/state/vehicleStore'
import type { HealthStatus } from '@/types/diagnostics'
import './VehicleHealthScreen.css'

const STATUS_COLOR: Record<HealthStatus, string> = {
  NORMAL: 'var(--cl-primary)',
  OBSERVE: 'var(--cl-amber)',
  WARNING: 'var(--cl-warning-amber)',
  UNKNOWN: 'var(--cl-muted-text)',
}

export function VehicleHealthScreen() {
  const health = useVehicleStore((s) => s.health)
  const speed = useVehicleStore((s) => s.telemetry.speedKph.value)
  const locked = speed > 5
  const [selectedKey, setSelectedKey] = useState(health[0]?.key)
  const selected = health.find((h) => h.key === selectedKey) ?? health[0]

  return (
    <div className="rd-screen">
      <div className="rd-section-title" style={{ marginTop: 8 }}>
        VEHICLE HEALTH
      </div>
      {locked ? (
        <div className="rd-health-locked">VEHICLE IN MOTION — DETAIL VIEW LOCKED. USE PHONE APP.</div>
      ) : (
        <div className="rd-health">
          <div className="rd-health-list">
            {health.map((h) => (
              <div
                key={h.key}
                className={`rd-health-row${h.key === selected?.key ? ' selected' : ''}`}
                onClick={() => setSelectedKey(h.key)}
              >
                <span>{h.label}</span>
                <span className="rd-health-status" style={{ color: STATUS_COLOR[h.status] }}>
                  {h.status}
                </span>
              </div>
            ))}
          </div>
          {selected && (
            <div className="rd-health-detail">
              <div className="rd-health-detail-title">
                {selected.label} / <span style={{ color: STATUS_COLOR[selected.status] }}>{selected.status}</span>
              </div>
              {selected.evidenceLines.map((line, i) => (
                <div className="rd-health-evidence-line" key={i}>
                  {line}
                </div>
              ))}
              <div className="rd-health-note">{selected.statusNote}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
