export interface SpectrumVisualizerProps {
  levels: number[]
  color?: string
  heightPx?: number
  active?: boolean
}

export function SpectrumVisualizer({ levels, color = 'var(--cl-primary)', heightPx = 48, active = true }: SpectrumVisualizerProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: heightPx, width: '100%' }}>
      {levels.map((lvl, i) => {
        const h = active ? Math.max(4, lvl * heightPx) : 4
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: h,
              background: color,
              opacity: active ? 0.5 + lvl * 0.5 : 0.25,
              boxShadow: active ? `0 0 4px ${color}` : 'none',
              transition: 'height 0.09s linear',
            }}
          />
        )
      })}
    </div>
  )
}
