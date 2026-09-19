import type { BoostUnit } from '@/types/vehicle'
import './BoostGauge.css'

export interface BoostGaugeProps {
  valueBar: number
  peakBar?: number
  unit: BoostUnit
  minBar?: number
  maxBar?: number
  warningBar?: number
  criticalBar?: number
  available?: boolean
  segments?: number
}

const BAR_TO_PSI = 14.5038

function formatUnit(bar: number, unit: BoostUnit) {
  return unit === 'PSI' ? bar * BAR_TO_PSI : bar
}

export function BoostGauge({
  valueBar,
  peakBar,
  unit,
  minBar = -1.0,
  maxBar = 1.6,
  warningBar = 1.2,
  criticalBar = 1.4,
  available = true,
  segments = 32,
}: BoostGaugeProps) {
  const span = maxBar - minBar
  const ratio = (v: number) => Math.min(1, Math.max(0, (v - minBar) / span))
  const zeroRatio = ratio(0)
  const valueRatio = ratio(valueBar)
  const litFrom = Math.min(zeroRatio, valueRatio)
  const litTo = Math.max(zeroRatio, valueRatio)

  const color = valueBar >= criticalBar ? 'var(--cl-critical-red)' : valueBar >= warningBar ? 'var(--cl-warning-amber)' : 'var(--cl-primary)'

  const displayVal = formatUnit(valueBar, unit)
  const scaleValues = unit === 'BAR' ? [-1.0, -0.5, 0, 0.5, 1.0, 1.5] : [-15, -10, -5, 0, 5, 10, 15, 20]

  return (
    <div className="rd-boost">
      <div className="rd-boost-head">
        <span className="rd-boost-label">BOOST</span>
        {peakBar !== undefined && (
          <span className="rd-boost-peak">PEAK {formatUnit(peakBar, unit).toFixed(unit === 'BAR' ? 2 : 1)}</span>
        )}
      </div>
      <div className="rd-boost-value tabular-num" style={{ color: available ? color : 'var(--cl-muted-text)' }}>
        {available ? `${displayVal >= 0 ? '+' : ''}${displayVal.toFixed(unit === 'BAR' ? 2 : 1)}` : '--'}
        <span style={{ fontSize: 12, color: 'var(--cl-muted-text)', marginLeft: 4 }}>{unit === 'BAR' ? 'bar' : 'psi'}</span>
      </div>
      <div className="rd-boost-track">
        <div className="rd-boost-zero-mark" style={{ left: `${zeroRatio * 100}%` }} />
        {peakBar !== undefined && <div className="rd-boost-peak-mark" style={{ left: `${ratio(peakBar) * 100}%` }} />}
        {Array.from({ length: segments }).map((_, i) => {
          const segRatio = i / segments
          const lit = available && segRatio >= litFrom && segRatio <= litTo
          return <div key={i} className="rd-boost-seg" style={lit ? { background: color, boxShadow: `0 0 4px ${color}` } : undefined} />
        })}
      </div>
      <div className="rd-boost-scale">
        {scaleValues.map((v) => (
          <span key={v}>{v > 0 ? `+${v}` : v}</span>
        ))}
      </div>
    </div>
  )
}
