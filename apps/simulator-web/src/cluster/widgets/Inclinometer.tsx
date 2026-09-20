import './OffroadWidgets.css'

export function Inclinometer({ pitchDeg, rollDeg, size = 180, variant = 'DIGITAL' }: { pitchDeg: number; rollDeg: number; size?: number; variant?: 'ANALOGUE' | 'DIGITAL' }) {
  const clampedPitch = Math.max(-35, Math.min(35, pitchDeg))
  const clampedRoll = Math.max(-30, Math.min(30, rollDeg))
  const horizonY = 50 + clampedPitch * 0.8
  const pitchCaution = Math.abs(pitchDeg) >= 22
  const rollCaution = Math.abs(rollDeg) >= 18

  return (
    <div className={`rd-inclino rd-inclino-${variant.toLowerCase()}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <clipPath id="rd-inclino-clip">
          <circle cx={50} cy={50} r={46} />
        </clipPath>
        <circle cx={50} cy={50} r={46} fill="var(--cl-panel-alt)" />
        <g clipPath="url(#rd-inclino-clip)">
          <g transform={`rotate(${-clampedRoll} 50 ${horizonY})`}>
            <rect x={-30} y={horizonY} width={160} height={90} fill="var(--cl-primary-dim)" opacity={0.16} />
            <line x1={-30} x2={130} y1={horizonY} y2={horizonY} stroke="var(--cl-primary)" strokeWidth={1.5} />
            {[-20, -10, 10, 20].map((d) => (
              <line key={d} x1={38} x2={62} y1={horizonY - d * 0.8} y2={horizonY - d * 0.8} stroke="var(--cl-grid-line)" strokeWidth={0.5} />
            ))}
          </g>
        </g>
        <circle cx={50} cy={50} r={46} fill="none" stroke="var(--cl-grid-line)" />
        <polygon points="40,50 60,50 54,45 46,45" fill="var(--cl-primary-bright)" />
        <path d="M14 50 A36 36 0 0 1 86 50" fill="none" stroke="var(--cl-grid-line)" strokeWidth={0.5} />
        {[-30, -15, 15, 30].map((d) => {
          const rad = ((90 - d) * Math.PI) / 180
          return <line key={d} x1={50 + Math.cos(rad) * 40} y1={50 - Math.sin(rad) * 40} x2={50 + Math.cos(rad) * 46} y2={50 - Math.sin(rad) * 46} stroke="var(--cl-grid-line)" strokeWidth={0.5} />
        })}
      </svg>
      <div className="rd-inclino-readout">
        <div>
          <label>PITCH</label>
          <strong className="tabular-num" style={{ color: pitchCaution ? 'var(--cl-warning-amber)' : undefined }}>{pitchDeg >= 0 ? '+' : ''}{pitchDeg.toFixed(0)}°</strong>
        </div>
        <div>
          <label>ROLL</label>
          <strong className="tabular-num" style={{ color: rollCaution ? 'var(--cl-warning-amber)' : undefined }}>{rollDeg >= 0 ? '+' : ''}{rollDeg.toFixed(0)}°</strong>
        </div>
      </div>
    </div>
  )
}
