import { useVehicleStore } from '@/state/vehicleStore'
import './mobile.css'

function formatDuration(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function TripsScreen({ onOpenTrip }: { onOpenTrip: (id: string) => void }) {
  const trips = useVehicleStore((s) => s.trips)

  if (trips.length === 0) return <div className="rd-m-empty">NO TRIPS RECORDED YET</div>

  return (
    <div className="rd-m-card">
      {trips.map((t) => (
        <div className="rd-m-row clickable" key={t.id} onClick={() => onOpenTrip(t.id)}>
          <div>
            <div className="rd-m-row-label" style={{ fontWeight: 700 }}>{t.label}</div>
            <div style={{ fontSize: 12, color: '#6c786f', marginTop: 2 }}>
              {t.distanceKm.toFixed(1)} km &middot; {formatDuration(t.timeSeconds)}
            </div>
          </div>
          <span className="rd-m-row-value">{t.averageSpeedKph.toFixed(0)} km/h avg</span>
        </div>
      ))}
    </div>
  )
}
