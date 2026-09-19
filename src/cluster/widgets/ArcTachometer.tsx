export interface ArcTachometerProps {
  rpm: number
  redlineRpm: number
  size?: number
  startAngleDeg?: number
  endAngleDeg?: number
  segments?: number
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
}

export function ArcTachometer({
  rpm,
  redlineRpm,
  size = 420,
  startAngleDeg = 210,
  endAngleDeg = -30,
  segments = 44,
}: ArcTachometerProps) {
  const maxScale = Math.ceil((redlineRpm + 500) / 1000) * 1000
  const cx = size / 2
  const cy = size * 0.62
  const rOuter = size * 0.46
  const rInner = size * 0.37
  const ratio = Math.min(1, Math.max(0, rpm / maxScale))
  const litCount = Math.round(ratio * segments)
  const redlineRatio = redlineRpm / maxScale

  const scaleMarks = Array.from({ length: maxScale / 1000 + 1 }, (_, i) => i)

  return (
    <svg width={size} height={size * 0.68} viewBox={`0 0 ${size} ${size * 0.68}`}>
      {Array.from({ length: segments }).map((_, i) => {
        const t = i / (segments - 1)
        const angle = startAngleDeg + (endAngleDeg - startAngleDeg) * t
        const segRatio = i / segments
        const lit = i < litCount
        const color = segRatio >= redlineRatio ? 'var(--cl-critical-red)' : segRatio >= redlineRatio * 0.86 ? 'var(--cl-warning-amber)' : 'var(--cl-primary)'
        const p1 = polar(cx, cy, rInner, angle)
        const p2 = polar(cx, cy, rOuter, angle)
        return (
          <line
            key={i}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke={lit ? color : 'var(--cl-grid-line)'}
            strokeWidth={size * 0.012}
            strokeLinecap="square"
            style={lit ? { filter: `drop-shadow(0 0 3px ${color})` } : undefined}
          />
        )
      })}
      {scaleMarks.map((n) => {
        const t = n / (maxScale / 1000)
        const angle = startAngleDeg + (endAngleDeg - startAngleDeg) * t
        const p = polar(cx, cy, rOuter + size * 0.055, angle)
        return (
          <text key={n} x={p.x} y={p.y} fontSize={size * 0.032} fill="var(--cl-muted-text)" textAnchor="middle" dominantBaseline="middle">
            {n}
          </text>
        )
      })}
      <text x={cx} y={cy - rInner * 0.62} fontSize={size * 0.026} fill="var(--cl-muted-text)" textAnchor="middle" letterSpacing={2}>
        RPM &times;1000
      </text>
    </svg>
  )
}
