export interface WarningLampProps {
  label: string
  lit: boolean
  color?: string
}

export function WarningLamp({ label, lit, color = 'var(--cl-warning-amber)' }: WarningLampProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        width: 56,
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: 2,
          background: lit ? color : 'transparent',
          border: `1px solid ${lit ? color : 'var(--cl-grid-line)'}`,
          boxShadow: lit ? `0 0 8px ${color}` : 'none',
          transition: 'all 0.15s ease',
        }}
      />
      <span
        style={{
          fontSize: 9,
          letterSpacing: 1,
          color: lit ? color : 'var(--cl-muted-text)',
          textAlign: 'center',
          lineHeight: 1.1,
        }}
      >
        {label}
      </span>
    </div>
  )
}
