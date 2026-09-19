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

  const { pathD, current, origin, parked } = useMemo(() => {
    const route=breadcrumb.length?breadcrumb:[{lat:telemetry.latitude.value,lon:telemetry.longitude.value,t:Date.now()}]
    const ref = route[0]
    const W = 340
    const H = 220
    const raw = route.map((p) => project(p.lat, p.lon, ref.lat, ref.lon))
    const parkRaw=parkedLocation?project(parkedLocation.lat,parkedLocation.lon,ref.lat,ref.lon):null
    const all=parkRaw?[...raw,parkRaw]:raw
    const maxX = Math.max(20, ...all.map((p) => Math.abs(p.x)))
    const maxY = Math.max(20, ...all.map((p) => Math.abs(p.y)))
    const scale = Math.min((W / 2 - 20) / maxX, (H / 2 - 20) / maxY)
    const toScreen = (p: { x: number; y: number }) => ({ x: W / 2 + p.x * scale, y: H / 2 - p.y * scale })
    const screenPts = raw.map(toScreen)
    const d = screenPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    return { pathD: d, current: screenPts[screenPts.length - 1], origin: screenPts[0], parked:parkRaw?toScreen(parkRaw):null }
  }, [breadcrumb,parkedLocation,telemetry.latitude.value,telemetry.longitude.value])

  return (
    <div>
      <div className="rd-m-card">
        <div className="rd-m-card-title">TRIP ROUTE (OFFLINE PREVIEW)</div>
        <svg viewBox="0 0 340 220" width="100%" height="200">
          <rect x={0} y={0} width={340} height={220} fill="#0d1210" />
          {Array.from({length:9},(_,i)=><g key={i} stroke="var(--cl-grid-line)" strokeWidth=".5"><path d={`M${i*42} 0 V220 M0 ${i*28} H340`}/></g>)}
          <text x="320" y="18" fill="var(--cl-primary)" fontSize="10">N ↑</text>
          {parked&&<g><circle cx={parked.x} cy={parked.y} r="8" fill="#d1aa5c"/><text x={parked.x} y={parked.y+3} textAnchor="middle" fontSize="9">P</text></g>}
          {!gpsFix && (
            <text x={170} y={110} textAnchor="middle" fill="#e06a5a" fontSize={12}>NO GPS FIX</text>
          )}
          {pathD && <path d={pathD} fill="none" stroke="var(--cl-primary)" strokeWidth={2} opacity={gpsFix?.85:.3} />}
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
