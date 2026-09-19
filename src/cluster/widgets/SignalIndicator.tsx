export interface SignalIndicatorProps {
  label: string
  state: 'OK' | 'PENDING' | 'FAULT'
  detail?: string
}

const STATE_COLOR: Record<SignalIndicatorProps['state'], string> = {
  OK: 'var(--cl-primary)',
  PENDING: 'var(--cl-warning-amber)',
  FAULT: 'var(--cl-critical-red)',
}

export function SignalIndicator({ label, state, detail }: SignalIndicatorProps) {
  const color = STATE_COLOR[state]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, letterSpacing: 1 }}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 5px ${color}`,
          flexShrink: 0,
        }}
      />
      <span style={{ color: 'var(--cl-muted-text)' }}>{label}</span>
      {detail && <span style={{ color }}>{detail}</span>}
    </div>
  )
}
