import { useVehicleStore } from '@/state/vehicleStore'
import './mobile.css'

function seededPath(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const rand = () => {
    h = (h * 1103515245 + 12345) >>> 0
    return (h % 1000) / 1000
  }
  const points: [number, number][] = [[10, 90]]
  for (let i = 1; i < 6; i++) {
    points.push([10 + i * 56, 20 + rand() * 70])
  }
  return points
}

export function TripDetailScreen({ tripId }: { tripId: string }) {
  const trip = useVehicleStore((s) => s.trips).find((t) => t.id === tripId)
  if (!trip) return <div className="rd-m-empty">TRIP NOT FOUND</div>

  const points = seededPath(trip.id)
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')

  return (
    <div>
      <div className="rd-m-card">
        <div style={{ fontSize: 11, color: '#6c786f', marginBottom: 8 }}>ROUTE PREVIEW (OFFLINE)</div>
        <svg viewBox="0 0 340 110" width="100%" height="110">
          <path d={pathD} fill="none" stroke="#8fcb83" strokeWidth={2} strokeDasharray="4 4" opacity={0.8} />
          {points.map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r={i === 0 || i === points.length - 1 ? 4 : 2.5} fill={i === 0 ? '#8fcb83' : i === points.length - 1 ? '#e06a5a' : '#345c40'} />
          ))}
        </svg>
      </div>

      <div className="rd-m-card">
        <div className="rd-m-row"><span className="rd-m-row-label">Distance</span><span className="rd-m-row-value">{trip.distanceKm.toFixed(1)} km</span></div>
        <div className="rd-m-row"><span className="rd-m-row-label">Time</span><span className="rd-m-row-value">{Math.floor(trip.timeSeconds / 60)} min</span></div>
        <div className="rd-m-row"><span className="rd-m-row-label">Average speed</span><span className="rd-m-row-value">{trip.averageSpeedKph.toFixed(0)} km/h</span></div>
        <div className="rd-m-row"><span className="rd-m-row-label">Max speed</span><span className="rd-m-row-value">{trip.maxSpeedKph.toFixed(0)} km/h</span></div>
        <div className="rd-m-row"><span className="rd-m-row-label">Max coolant</span><span className="rd-m-row-value">{trip.maxCoolantC.toFixed(0)}&deg;C</span></div>
        <div className="rd-m-row"><span className="rd-m-row-label">Max RPM</span><span className="rd-m-row-value">{trip.maxRpm.toFixed(0)}</span></div>
      </div>

      <div className="rd-m-card">
        <div className="rd-m-card-title">WARNINGS DURING TRIP</div>
        {trip.warnings.length === 0 ? <div className="rd-m-empty">NONE</div> : trip.warnings.map((w, i) => <div className="rd-m-row" key={i}><span className="rd-m-row-label">{w}</span></div>)}
      </div>

      <div className="rd-m-card">
        <div className="rd-m-card-title">DTC OCCURRENCES</div>
        {trip.dtcOccurrences.length === 0 ? <div className="rd-m-empty">NONE</div> : trip.dtcOccurrences.map((c, i) => <div className="rd-m-row" key={i}><span className="rd-m-row-label">{c}</span></div>)}
      </div>
    </div>
  )
}
