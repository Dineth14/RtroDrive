import type { GaugeZone } from './RetroGauge'

export interface VerticalBarGaugeProps {
  label: string
  value: number
  unit?: string
  min: number
  max: number
  displayValue?: string
  segments?: number
  heightPx?: number
  zoneFor?: (ratio: number) => GaugeZone
  available?: boolean
}

const defaultZoneFor = (ratio: number): GaugeZone => (ratio > 0.88 ? 'critical' : ratio > 0.72 ? 'caution' : 'normal')

export function VerticalBarGauge({
  label,
  value,
  unit,
  min,
  max,
  displayValue,
  segments = 16,
  heightPx = 160,
  zoneFor = defaultZoneFor,
  available = true,
}: VerticalBarGaugeProps) {
  const ratio = Math.min(1, Math.max(0, (value - min) / (max - min)))
  const litCount = Math.round(ratio * segments)
  const zone = zoneFor(ratio)
  const color = zone === 'critical' ? 'var(--cl-critical-red)' : zone === 'caution' ? 'var(--cl-warning-amber)' : 'var(--cl-primary)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, letterSpacing: 2, color: 'var(--cl-muted-text)' }}>{label}</span>
      <div
        style={{
          height: heightPx,
          width: 26,
          background: 'var(--cl-panel-alt)',
          border: '1px solid var(--cl-grid-line)',
          display: 'flex',
          flexDirection: 'column-reverse',
          padding: 3,
          gap: 2,
        }}
      >
        {Array.from({ length: segments }).map((_, i) => {
          const lit = available && i < litCount
          return (
            <div
              key={i}
              style={{
                flex: 1,
                background: lit ? color : 'var(--cl-grid-line)',
                boxShadow: lit ? `0 0 4px ${color}` : undefined,
              }}
            />
          )
        })}
      </div>
      <span className="tabular-num" style={{ fontSize: 18, fontWeight: 700, color: available ? color : 'var(--cl-muted-text)' }}>
        {available ? (displayValue ?? value.toFixed(0)) : '--'}
        {unit && <span style={{ fontSize: 10, color: 'var(--cl-muted-text)', marginLeft: 2 }}>{unit}</span>}
      </span>
    </div>
  )
}
