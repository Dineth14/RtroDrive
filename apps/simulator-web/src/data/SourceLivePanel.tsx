import { useEffect, useState } from 'react'
import type { TelemetryPacket } from '../../../../shared/telemetry.mjs'
import type { SourceStatus } from './TelemetrySource'
import './source.css'

/** Capability view until each legacy layout has been qualified for sparse real snapshots. */
export function SourceLivePanel({ packet, status, receivedAt, compact = false }: { packet: TelemetryPacket | null; status: SourceStatus; receivedAt: number; compact?: boolean }) {
  const [now, setNow] = useState(() => performance.now())
  useEffect(() => { const timer = window.setInterval(() => setNow(performance.now()), 200); return () => clearInterval(timer) }, [])
  const entries = packet ? Object.entries(packet.channels).filter(([, s]) => s.valid && s.value !== null && s.ageMs + Math.max(0, now - receivedAt) <= 3000 && (s.source !== 'obd' || packet.connectionState === 'connected')) : []
  return <section className={`rd-source-live ${compact ? 'compact' : ''}`} aria-label="Source-aware live telemetry">
    <header><span>RETRODRIVE</span><b>LIVE DATA</b></header>
    <p>{packet?.vehicleProfile.replaceAll('_', ' ').toUpperCase() ?? 'WAITING FOR DATA'} · {status.toUpperCase()}</p>
    <p>VEHICLE {packet?.connectionState.toUpperCase() ?? 'UNKNOWN'} {packet?.channels && Object.values(packet.channels).some(s => s.source === 'simulated') ? '· SIMULATED' : ''}</p>
    {entries.length ? <div className="rd-source-grid">{entries.map(([name, s]) => <article key={name}><label>{name.replace(/([A-Z])/g, ' $1').toUpperCase()}</label><strong>{s.value!.toFixed(s.unit === 'rpm' || s.unit === 'count' ? 0 : 1)} <small>{s.unit}</small></strong><span>{s.source.toUpperCase()}</span></article>)}</div> : <p className="rd-source-empty">No fresh measurements available</p>}
    <footer>READ-ONLY · UNSUPPORTED AND STALE CHANNELS HIDDEN</footer>
  </section>
}
