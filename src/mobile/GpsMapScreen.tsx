import { useMemo } from 'react'
import { MapPin, Navigation } from 'lucide-react'
import { useVehicleStore } from '@/state/vehicleStore'
import './mobile.css'

function project(lat: number, lon: number, lat0: number, lon0: number) {
  const dx = (lon - lon0) * 111320 * Math.cos((lat0 * Math.PI) / 180)
  const dy = (lat - lat0) * 110540
  return { x: dx, y: dy }
}

export function GpsMapScreen() {
  const telemetry = useVehicleStore((s) => s.telemetry)
  const connections = useVehicleStore((s) => s.connections)
  const breadcrumb = useVehicleStore((s) => s.gpsBreadcrumb)
  const parkedLocation = useVehicleStore((s) => s.parkedLocation)
  const gpsFix = connections.gps === 'FIX'

  const { pathD, current, origin } = useMemo(() => {
    if (breadcrumb.length < 2) return { pathD: '', current: null, origin: null }
    const ref = breadcrumb[0]
    const W = 340
    const H = 220
    const raw = breadcrumb.map((p) => project(p.lat, p.lon, ref.lat, ref.lon))
    const maxX = Math.max(20, ...raw.map((p) => Math.abs(p.x)))
    const maxY = Math.max(20, ...raw.map((p) => Math.abs(p.y)))
    const scale = Math.min((W / 2 - 20) / maxX, (H / 2 - 20) / maxY)
    const toScreen = (p: { x: number; y: number }) => ({ x: W / 2 + p.x * scale, y: H / 2 - p.y * scale })
    const screenPts = raw.map(toScreen)
    const d = screenPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    return { pathD: d, current: screenPts[screenPts.length - 1], origin: screenPts[0] }
  }, [breadcrumb])

  return (
    <div>
      <div className="rd-m-card">
        <div className="rd-m-card-title">TRIP ROUTE (OFFLINE PREVIEW)</div>
        <svg viewBox="0 0 340 220" width="100%" height="200">
          <rect x={0} y={0} width={340} height={220} fill="#0d1210" />
          {!gpsFix && (
            <text x={170} y={110} textAnchor="middle" fill="#e06a5a" fontSize={12}>NO GPS FIX</text>
          )}
          {gpsFix && pathD && <path d={pathD} fill="none" stroke="#8fcb83" strokeWidth={2} opacity={0.85} />}
          {gpsFix && origin && <circle cx={origin.x} cy={origin.y} r={4} fill="#d7a94a" />}
          {gpsFix && current && <circle cx={current.x} cy={current.y} r={5} fill="#8fcb83" />}
        </svg>
      </div>

      <div className="rd-m-card">
        <div className="rd-m-row">
          <span className="rd-m-row-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Navigation size={14} color="#8fcb83" /> Heading
          </span>
          <span className="rd-m-row-value">{gpsFix ? `${Math.round(telemetry.headingDeg.value)}°` : '--'}</span>
        </div>
        <div className="rd-m-row">
          <span className="rd-m-row-label">Trip distance</span>
          <span className="rd-m-row-value">{telemetry.tripDistanceKm.value.toFixed(1)} km</span>
        </div>
        <div className="rd-m-row">
          <span className="rd-m-row-label">Average speed</span>
          <span className="rd-m-row-value">{telemetry.averageSpeedKph.value.toFixed(0)} km/h</span>
        </div>
        <div className="rd-m-row">
          <span className="rd-m-row-label">Max speed</span>
          <span className="rd-m-row-value">{telemetry.maxSpeedKph.value.toFixed(0)} km/h</span>
        </div>
      </div>

      <div className="rd-m-card">
        <div className="rd-m-card-title">LAST PARKED POSITION</div>
        {parkedLocation ? (
          <div className="rd-m-row" style={{ alignItems: 'flex-start' }}>
            <span className="rd-m-row-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={14} color="#e0a33a" /> {parkedLocation.lat.toFixed(4)}, {parkedLocation.lon.toFixed(4)}
            </span>
            <span style={{ fontSize: 11, color: '#6c786f' }}>{new Date(parkedLocation.timestamp).toLocaleTimeString()}</span>
          </div>
        ) : (
          <div className="rd-m-empty">NOT RECORDED YET</div>
        )}
      </div>
    </div>
  )
}
