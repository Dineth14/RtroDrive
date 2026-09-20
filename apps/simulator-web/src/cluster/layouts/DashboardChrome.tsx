import { useEffect, useState } from 'react'
import { formatClock, headingToCompass } from './useDashboardData'
import type { TelemetrySnapshot } from '@/types/telemetry'

export function OdoTripClockRow({ telemetry }: { telemetry: TelemetrySnapshot }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 10000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, letterSpacing: 1, color: 'var(--cl-muted-text)' }}>
      <span>
        ODO <span className="tabular-num" style={{ color: 'var(--cl-primary)' }}>{Math.round(telemetry.odometerKm.value).toLocaleString()}</span> km
      </span>
      <span>
        TRIP A <span className="tabular-num" style={{ color: 'var(--cl-primary)' }}>{telemetry.tripDistanceKm.value.toFixed(1)}</span> km
      </span>
      <span>
        GEAR <span className="tabular-num" style={{ color: 'var(--cl-primary)' }}>{telemetry.gearPosition.value}</span>
      </span>
      <span className="tabular-num">{formatClock(now)}</span>
    </div>
  )
}

export function GpsMiniIndicator({ telemetry, gpsFix }: { telemetry: TelemetrySnapshot; gpsFix: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, letterSpacing: 1, color: 'var(--cl-muted-text)' }}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: gpsFix ? 'var(--cl-primary)' : 'var(--cl-grid-line)',
          boxShadow: gpsFix ? '0 0 5px var(--cl-primary)' : undefined,
        }}
      />
      <span>GPS</span>
      {gpsFix && <span style={{ color: 'var(--cl-primary)' }}>{headingToCompass(telemetry.headingDeg.value)}</span>}
    </div>
  )
}

export function MediaTicker({ visible, title, artist }: { visible: boolean; title: string; artist: string }) {
  if (!visible) return null
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 8,
        left: 34,
        fontSize: 12,
        letterSpacing: 1,
        color: 'var(--cl-amber)',
        textShadow: '0 0 6px currentColor',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
      }}
    >
      <span>&#9835;</span>
      <span>
        {title} — {artist}
      </span>
    </div>
  )
}
