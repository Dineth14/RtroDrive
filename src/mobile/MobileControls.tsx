import './mobile.css'

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button className={`rd-m-toggle${on ? ' on' : ''}`} onClick={() => onChange(!on)} aria-pressed={on}>
      <span className="rd-m-toggle-knob" />
    </button>
  )
}

export function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  format,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  return (
    <div className="rd-m-slider-row">
      <div className="rd-m-slider-label">
        <span>{label}</span>
        <span className="rd-m-slider-value">{format ? format(value) : `${value}${unit}`}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#8fcb83' }}
      />
    </div>
  )
}

export function ToggleRow({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="rd-m-row">
      <span className="rd-m-row-label">{label}</span>
      <Toggle on={on} onChange={onChange} />
    </div>
  )
}
