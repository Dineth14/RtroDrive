import { headingToCompass } from '../layouts/useDashboardData'
import './OffroadWidgets.css'

const CARDINALS: [string, number][] = [['N', 0], ['NE', 45], ['E', 90], ['SE', 135], ['S', 180], ['SW', 225], ['W', 270], ['NW', 315]]

export function CompassRose({ headingDeg, size = 120, label = 'HEADING', mode = 'HEADING' }: { headingDeg: number; size?: number; label?: string; mode?: 'HEADING' | 'BEARING' }) {
  return (
    <div className="rd-compass" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx={50} cy={50} r={46} fill="var(--cl-panel)" stroke="var(--cl-grid-line)" />
        <g transform={`rotate(${-headingDeg} 50 50)`}>
          {Array.from({ length: 36 }, (_, i) => {
            const deg = i * 10
            const rad = (deg * Math.PI) / 180
            const major = deg % 90 === 0
            const r1 = major ? 37 : 41
            return (
              <line key={i} x1={50 + Math.sin(rad) * r1} y1={50 - Math.cos(rad) * r1} x2={50 + Math.sin(rad) * 45} y2={50 - Math.cos(rad) * 45} stroke="var(--cl-grid-line)" strokeWidth={major ? 1 : 0.5} />
            )
          })}
          {CARDINALS.map(([d, deg]) => {
            const rad = (deg * Math.PI) / 180
            const x = 50 + Math.sin(rad) * 33
            const y = 50 - Math.cos(rad) * 33
            return (
              <text key={d} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={d.length > 1 ? 7 : 9} fill={d === 'N' ? 'var(--cl-critical-red)' : 'var(--cl-primary)'}>
                {d}
              </text>
            )
          })}
        </g>
        <polygon points="50,8 46,20 54,20" fill="var(--cl-primary-bright)" style={{ filter: 'drop-shadow(0 0 3px var(--cl-primary-bright))' }} />
      </svg>
      <div className="rd-compass-readout">
        <strong className="tabular-num">{Math.round(headingDeg)}°</strong>
        <span>{mode === 'BEARING' ? label : `${headingToCompass(headingDeg)} · ${label}`}</span>
      </div>
    </div>
  )
}
