import './RetroGauge.css'

export type GaugeZone = 'normal' | 'caution' | 'critical'

export interface RetroGaugeProps {
  label: string
  value: number
  unit?: string
  min: number
  max: number
  displayValue?: string
  segments?: number
  zoneFor?: (ratio: number) => GaugeZone
  colorFor?: (zone: GaugeZone) => string
  available?: boolean
}

const defaultZoneFor = (ratio: number): GaugeZone => (ratio > 0.88 ? 'critical' : ratio > 0.72 ? 'caution' : 'normal')

export function RetroGauge({
  label,
  value,
  unit,
  min,
  max,
  displayValue,
  segments = 14,
  zoneFor = defaultZoneFor,
  colorFor,
  available = true,
}: RetroGaugeProps) {
  const ratio = Math.min(1, Math.max(0, (value - min) / (max - min)))
  const litCount = Math.round(ratio * segments)
  const zone = zoneFor(ratio)
  const color = colorFor
    ? colorFor(zone)
    : zone === 'critical'
      ? 'var(--cl-critical-red)'
      : zone === 'caution'
        ? 'var(--cl-warning-amber)'
        : 'var(--cl-primary)'

  return (
    <div className="rd-gauge">
      <div className="rd-gauge-head">
        <span className="rd-gauge-label">{label}</span>
      </div>
      <div className="rd-gauge-value-row">
        <span className="rd-gauge-value tabular-num" style={{ color: available ? color : 'var(--cl-muted-text)' }}>
          {available ? (displayValue ?? value.toFixed(1)) : '--'}
        </span>
        {unit && <span className="rd-gauge-unit">{unit}</span>}
      </div>
      <div className="rd-gauge-track">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`rd-gauge-seg${available && i < litCount ? ' lit' : ''}`}
            style={available && i < litCount ? { background: color, color } : undefined}
          />
        ))}
      </div>
    </div>
  )
}
