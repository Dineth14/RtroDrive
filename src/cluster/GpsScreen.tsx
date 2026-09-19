import { useMemo } from 'react'
import { useVehicleStore } from '@/state/vehicleStore'
import { headingToCompass } from './layouts/useDashboardData'
import './GpsScreen.css'

const VIEW = 420

function project(lat: number, lon: number, lat0: number, lon0: number) {
  const dx = (lon - lon0) * 111320 * Math.cos((lat0 * Math.PI) / 180)
  const dy = (lat - lat0) * 110540
  return { x: dx, y: dy }
}

function NavArrow({ kind }: { kind: string }) {
  if (kind === 'TURN_LEFT') {
    return (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--cl-primary-bright)" strokeWidth="2">
        <path d="M18 18V10a5 5 0 0 0-5-5H8" />
        <path d="M11 8 5 5l3-3" strokeLinejoin="round" />
      </svg>
    )
  }
  if (kind === 'TURN_RIGHT') {
    return (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--cl-primary-bright)" strokeWidth="2">
        <path d="M6 18V10a5 5 0 0 1 5-5h5" />
        <path d="M13 8l6-3-3-3" strokeLinejoin="round" />
      </svg>
    )
  }
  if (kind === 'ROUNDABOUT') {
    return (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--cl-primary-bright)" strokeWidth="2">
        <circle cx="12" cy="12" r="6" />
        <path d="M12 2v6" />
        <path d="M9 4l3-2 3 2" strokeLinejoin="round" />
      </svg>
    )
  }
  if (kind === 'DESTINATION') {
    return (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--cl-primary-bright)" strokeWidth="2">
        <path d="M6 21V4a1 1 0 0 1 1-1h9l-2 4 2 4H7" />
      </svg>
    )
  }
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--cl-primary-bright)" strokeWidth="2">
      <path d="M12 20V4" />
      <path d="M8 8l4-4 4 4" strokeLinejoin="round" />
    </svg>
  )
}

export function GpsScreen() {
  const telemetry = useVehicleStore((s) => s.telemetry)
  const connections = useVehicleStore((s) => s.connections)
  const breadcrumb = useVehicleStore((s) => s.gpsBreadcrumb)
  const parkedLocation = useVehicleStore((s) => s.parkedLocation)
  const navMode = useVehicleStore((s) => s.navMode)
  const navInstruction = useVehicleStore((s) => s.navInstruction)
  const setNavMode = useVehicleStore((s) => s.setNavMode)

  const gpsFix = connections.gps === 'FIX'
  const heading = telemetry.headingDeg.value

  const { pathD, points, originPt, parkedPt } = useMemo(() => {
    if (breadcrumb.length < 2) return { pathD: '', points: [] as { x: number; y: number }[], originPt: null, parkedPt: null }
    const last = breadcrumb[breadcrumb.length - 1]
    const rad = (-heading * Math.PI) / 180
    const rotate = (x: number, y: number) => ({ x: x * Math.cos(rad) - y * Math.sin(rad), y: x * Math.sin(rad) + y * Math.cos(rad) })

    const raw = breadcrumb.map((p) => {
      const proj = project(p.lat, p.lon, last.lat, last.lon)
      return rotate(proj.x, proj.y)
    })
    const maxDist = Math.max(20, ...raw.map((p) => Math.hypot(p.x, p.y)))
    const scale = (VIEW * 0.42) / maxDist
    const toScreen = (p: { x: number; y: number }) => ({ x: VIEW / 2 + p.x * scale, y: VIEW / 2 - p.y * scale })
    const screenPts = raw.map(toScreen)
    const d = screenPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

    let parkedScreen = null
    if (parkedLocation) {
      const proj = project(parkedLocation.lat, parkedLocation.lon, last.lat, last.lon)
      const rp = rotate(proj.x, proj.y)
      const dist = Math.hypot(rp.x, rp.y)
      if (dist < maxDist * 1.4) parkedScreen = toScreen(rp)
    }

    return { pathD: d, points: screenPts, originPt: screenPts[0], parkedPt: parkedScreen }
  }, [breadcrumb, heading, parkedLocation])

  return (
    <div className="rd-screen">
      <div className="rd-gps">
        <div className="rd-gps-scope">
          {!gpsFix ? (
            <div className="rd-gps-lost">GPS SIGNAL LOST</div>
          ) : (
            <svg width="100%" height="100%" viewBox={`0 0 ${VIEW} ${VIEW}`}>
              {Array.from({ length: 9 }).map((_, i) => (
                <line key={`h${i}`} x1={0} y1={(VIEW / 8) * i} x2={VIEW} y2={(VIEW / 8) * i} stroke="var(--cl-grid-line)" strokeWidth={0.5} />
              ))}
              {Array.from({ length: 9 }).map((_, i) => (
                <line key={`v${i}`} x1={(VIEW / 8) * i} y1={0} x2={(VIEW / 8) * i} y2={VIEW} stroke="var(--cl-grid-line)" strokeWidth={0.5} />
              ))}
              <circle cx={VIEW / 2} cy={VIEW / 2} r={VIEW * 0.42} fill="none" stroke="var(--cl-grid-line)" strokeWidth={1} />
              <line x1={VIEW / 2 - 10} y1={VIEW / 2} x2={VIEW / 2 + 10} y2={VIEW / 2} stroke="var(--cl-primary-dim)" strokeWidth={1} />
              <line x1={VIEW / 2} y1={VIEW / 2 - 10} x2={VIEW / 2} y2={VIEW / 2 + 10} stroke="var(--cl-primary-dim)" strokeWidth={1} />
              <text x={VIEW / 2} y={22} fill="var(--cl-primary-dim)" fontSize={13} textAnchor="middle">N</text>

              {pathD && <path d={pathD} fill="none" stroke="var(--cl-primary)" strokeWidth={1.5} opacity={0.85} />}
              {originPt && <circle cx={originPt.x} cy={originPt.y} r={4} fill="var(--cl-amber)" />}
              {parkedPt && (
                <>
                  <circle cx={parkedPt.x} cy={parkedPt.y} r={5} fill="none" stroke="var(--cl-warning-amber)" strokeWidth={1.5} />
                  <text x={parkedPt.x} y={parkedPt.y - 10} fill="var(--cl-warning-amber)" fontSize={10} textAnchor="middle">PARKED</text>
                </>
              )}

              <polygon
                points={`${VIEW / 2},${VIEW / 2 - 11} ${VIEW / 2 - 7},${VIEW / 2 + 8} ${VIEW / 2},${VIEW / 2 + 4} ${VIEW / 2 + 7},${VIEW / 2 + 8}`}
                fill="var(--cl-primary-bright)"
                style={{ filter: 'drop-shadow(0 0 4px var(--cl-primary-bright))' }}
              />
            </svg>
          )}

          {navMode === 'PHONE_ASSISTED' && navInstruction && (
            <div className="rd-gps-nav-banner">
              <NavArrow kind={navInstruction.kind} />
              <div className="rd-gps-nav-label">
                {navInstruction.kind === 'STRAIGHT' && 'CONTINUE STRAIGHT'}
                {navInstruction.kind === 'TURN_LEFT' && 'TURN LEFT'}
                {navInstruction.kind === 'TURN_RIGHT' && 'TURN RIGHT'}
                {navInstruction.kind === 'ROUNDABOUT' && `ROUNDABOUT — ${navInstruction.roundaboutExit ?? 1}${navInstruction.roundaboutExit === 2 ? 'ND' : navInstruction.roundaboutExit === 3 ? 'RD' : 'ST'} EXIT`}
                {navInstruction.kind === 'DESTINATION' && 'DESTINATION REACHED'}
              </div>
              {navInstruction.kind !== 'DESTINATION' && <div className="rd-gps-nav-dist">{navInstruction.distanceM >= 1000 ? `${(navInstruction.distanceM / 1000).toFixed(1)} km` : `${navInstruction.distanceM} m`}</div>}
              {navInstruction.destinationDistanceKm !== undefined && (
                <div className="rd-gps-nav-dest">
                  <span>DEST {navInstruction.destinationDistanceKm.toFixed(1)} km</span>
                  <span>ETA {navInstruction.destinationEtaMin} MIN</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rd-gps-sidebar">
          <div className="rd-gps-mode-row">
            <button className={`rd-gps-mode-btn${navMode === 'STANDALONE' ? ' active' : ''}`} onClick={() => setNavMode('STANDALONE')}>
              STANDALONE
            </button>
            <button className={`rd-gps-mode-btn${navMode === 'PHONE_ASSISTED' ? ' active' : ''}`} onClick={() => setNavMode('PHONE_ASSISTED')}>
              PHONE NAV
            </button>
          </div>
          <div className="rd-gps-stat">
            <span className="rd-gps-stat-label">HEADING</span>
            <span className="rd-gps-stat-value tabular-num">{gpsFix ? `${Math.round(heading)}° ${headingToCompass(heading)}` : '--'}</span>
          </div>
          <div className="rd-gps-stat">
            <span className="rd-gps-stat-label">GPS SPEED</span>
            <span className="rd-gps-stat-value tabular-num">{gpsFix ? telemetry.gpsSpeedKph.value.toFixed(0) : '--'} km/h</span>
          </div>
          <div className="rd-gps-stat">
            <span className="rd-gps-stat-label">SATELLITES</span>
            <span className="rd-gps-stat-value tabular-num">{gpsFix ? telemetry.satelliteCount.value : '--'}</span>
          </div>
          <div className="rd-gps-stat">
            <span className="rd-gps-stat-label">ACCURACY</span>
            <span className="rd-gps-stat-value tabular-num">{gpsFix ? `±${telemetry.gpsAccuracyM.value.toFixed(1)}m` : '--'}</span>
          </div>
          <div className="rd-gps-stat">
            <span className="rd-gps-stat-label">TRIP DISTANCE</span>
            <span className="rd-gps-stat-value tabular-num">{telemetry.tripDistanceKm.value.toFixed(1)} km</span>
          </div>
          <div className="rd-gps-stat">
            <span className="rd-gps-stat-label">TRIP TIME</span>
            <span className="rd-gps-stat-value tabular-num">{Math.floor(telemetry.tripTimeSeconds.value / 60)} min</span>
          </div>
        </div>
      </div>
    </div>
  )
}
