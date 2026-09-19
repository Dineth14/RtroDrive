import './RpmBar.css'

export interface RpmBarProps {
  rpm: number
  redlineRpm: number
  segments?: number
}

export function RpmBar({ rpm, redlineRpm, segments = 56 }: RpmBarProps) {
  const maxScale = Math.ceil((redlineRpm + 500) / 1000) * 1000
  const scaleMarks = Array.from({ length: maxScale / 1000 + 1 }, (_, i) => i)
  const ratio = Math.min(1, Math.max(0, rpm / maxScale))
  const litCount = Math.round(ratio * segments)
  const redlineRatio = redlineRpm / maxScale

  const colorForIndex = (i: number) => {
    const segRatio = i / segments
    if (segRatio >= redlineRatio) return 'var(--cl-critical-red)'
    if (segRatio >= redlineRatio * 0.86) return 'var(--cl-warning-amber)'
    return 'var(--cl-primary)'
  }

  return (
    <div className="rd-rpmbar">
      <div className="rd-rpmbar-scale">
        {scaleMarks.map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
      <div className="rd-rpmbar-track">
        <div className="rd-rpmbar-redline-mark" style={{ left: `${redlineRatio * 100}%` }} />
        {Array.from({ length: segments }).map((_, i) => {
          const lit = i < litCount
          const color = colorForIndex(i)
          return (
            <div
              key={i}
              className="rd-rpmbar-seg"
              style={lit ? { background: color, boxShadow: `0 0 5px ${color}` } : undefined}
            />
          )
        })}
      </div>
      <div className="rd-rpmbar-caption">RPM &times;1000</div>
    </div>
  )
}
