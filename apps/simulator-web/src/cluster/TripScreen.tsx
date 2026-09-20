import { useVehicleStore } from '@/state/vehicleStore'
import './TripScreen.css'

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export function TripScreen() {
  const telemetry = useVehicleStore((s) => s.telemetry)
  const resetTrip = useVehicleStore((s) => s.resetTrip)

  return (
    <div className="rd-screen">
      <div className="rd-trip">
        <div className="rd-section-title" style={{ marginTop: 8 }}>
          TRIP A
        </div>
        <div className="rd-trip-grid">
          <div className="rd-trip-item">
            <span className="rd-trip-label">DISTANCE</span>
            <span className="rd-trip-value tabular-num">{telemetry.tripDistanceKm.value.toFixed(1)}</span>
            <span className="rd-trip-unit">km</span>
          </div>
          <div className="rd-trip-item">
            <span className="rd-trip-label">TIME</span>
            <span className="rd-trip-value tabular-num">{formatTime(telemetry.tripTimeSeconds.value)}</span>
            <span className="rd-trip-unit">h:m</span>
          </div>
          <div className="rd-trip-item">
            <span className="rd-trip-label">AVERAGE</span>
            <span className="rd-trip-value tabular-num">{telemetry.averageSpeedKph.value.toFixed(0)}</span>
            <span className="rd-trip-unit">km/h</span>
          </div>
          <div className="rd-trip-item">
            <span className="rd-trip-label">MAX SPEED</span>
            <span className="rd-trip-value tabular-num">{telemetry.maxSpeedKph.value.toFixed(0)}</span>
            <span className="rd-trip-unit">km/h</span>
          </div>
          <div className="rd-trip-item">
            <span className="rd-trip-label">MAX COOLANT</span>
            <span className="rd-trip-value tabular-num">{telemetry.maxCoolantC.value.toFixed(0)}</span>
            <span className="rd-trip-unit">&deg;C</span>
          </div>
          <div className="rd-trip-item">
            <span className="rd-trip-label">MAX RPM</span>
            <span className="rd-trip-value tabular-num">{telemetry.maxRpm.value.toFixed(0)}</span>
            <span className="rd-trip-unit">rpm</span>
          </div>
        </div>
        <button className="rd-trip-reset" onClick={resetTrip}>
          RESET TRIP A
        </button>
      </div>
    </div>
  )
}
