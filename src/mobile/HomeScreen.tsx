import { useVehicleStore } from '@/state/vehicleStore'
import { useSettingsStore } from '@/state/settingsStore'
import './mobile.css'

const STATUS_CLASS: Record<string, string> = {
  NORMAL: 'rd-m-status-normal',
  OBSERVE: 'rd-m-status-observe',
  WARNING: 'rd-m-status-warning',
  CRITICAL: 'rd-m-status-critical',
  UNKNOWN: 'rd-m-status-unknown',
}

function timeAgo(ts: number) {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 1) return 'just now'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m ago` : `${m}m ago`
}

export function HomeScreen({ onOpenDtc, onViewLocation }: { onOpenDtc: (code: string) => void; onViewLocation?: () => void }) {
  const vehicle = useSettingsStore((s) => s.vehicleProfile)
  const connections = useVehicleStore((s) => s.connections)
  const ignition = useVehicleStore((s) => s.ignition)
  const telemetry = useVehicleStore((s) => s.telemetry)
  const health = useVehicleStore((s) => s.health)
  const dtcs = useVehicleStore((s) => s.dtcs).filter((d) => d.status === 'ACTIVE')
  const trips = useVehicleStore((s) => s.trips)
  const parkedLocation = useVehicleStore((s) => s.parkedLocation)
  const lastTrip = trips[0]

  const overallGood = health.every((h) => h.status === 'NORMAL')
  const connected = connections.obd === 'CONNECTED'

  return (
    <div>
      <div className="rd-m-card">
        <div style={{ fontSize: 22, fontWeight: 700 }}>{vehicle.nickname}</div>
        <div style={{ fontSize: 12, color: connected ? '#8fcb83' : '#6c786f', marginTop: 4 }}>
          {connected ? 'CONNECTED' : 'DISCONNECTED'}
        </div>
      </div>

      {ignition === 'OFF' && parkedLocation && (
        <div className="rd-m-card">
          <div className="rd-m-card-title">PARKED</div>
          <div className="rd-m-row clickable" onClick={onViewLocation}>
            <span className="rd-m-row-label">{timeAgo(parkedLocation.timestamp)}</span>
            <span style={{ color: '#8fcb83', fontSize: 12 }}>VIEW LOCATION</span>
          </div>
        </div>
      )}

      <div className="rd-m-card">
        <div className="rd-m-card-title">VEHICLE HEALTH</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: overallGood ? '#8fcb83' : '#e0a33a' }}>
          {overallGood ? 'GOOD' : 'NEEDS ATTENTION'}
        </div>
        {health.slice(0, 3).map((h) => (
          <div className="rd-m-row" key={h.key}>
            <span className="rd-m-row-label">{h.label}</span>
            <span className={`rd-m-status-chip ${STATUS_CLASS[h.status]}`}>{h.status}</span>
          </div>
        ))}
      </div>

      <div className="rd-m-card">
        <div className="rd-m-card-title">CURRENT</div>
        <div className="rd-m-row">
          <span className="rd-m-row-label">Coolant</span>
          <span className="rd-m-row-value">{telemetry.coolantTempC.value.toFixed(0)}&deg;C</span>
        </div>
        <div className="rd-m-row">
          <span className="rd-m-row-label">Battery</span>
          <span className="rd-m-row-value">{telemetry.batteryVoltage.value.toFixed(1)}V</span>
        </div>
        <div className="rd-m-row">
          <span className="rd-m-row-label">Fuel</span>
          <span className="rd-m-row-value">{telemetry.fuelPercent.value.toFixed(0)}%</span>
        </div>
      </div>

      {lastTrip && (
        <div className="rd-m-card">
          <div className="rd-m-card-title">LAST TRIP</div>
          <div className="rd-m-row">
            <span className="rd-m-row-label">{lastTrip.label}</span>
            <span className="rd-m-row-value">{lastTrip.distanceKm.toFixed(1)} km</span>
          </div>
        </div>
      )}

      {dtcs.length > 0 && (
        <div className="rd-m-card">
          <div className="rd-m-card-title">{dtcs.length} DIAGNOSTIC OBSERVATION{dtcs.length > 1 ? 'S' : ''}</div>
          {dtcs.map((d) => (
            <div className="rd-m-row clickable" key={d.code} onClick={() => onOpenDtc(d.code)}>
              <span className="rd-m-row-label">{d.code}</span>
              <span className={`rd-m-status-chip ${STATUS_CLASS[d.severity] ?? 'rd-m-status-warning'}`}>{d.severity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
