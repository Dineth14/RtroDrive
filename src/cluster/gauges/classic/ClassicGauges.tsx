import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
export function useDampedValue(target: number, rate = 5) {
  const [value, setValue] = useState(target)
  const current = useRef(target)
  useEffect(() => {
    let frame = 0, last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, .1); last = now
      current.current += (target - current.current) * (1 - Math.exp(-rate * dt))
      setValue(current.current)
      if (Math.abs(target - current.current) > .01) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, rate])
  return value
}
const point = (angle: number, r: number) => ({ x: 150 + Math.sin(angle * Math.PI / 180) * r, y: 150 - Math.cos(angle * Math.PI / 180) * r })
export function ChromeBezel() {
  const id = useId()
  return <><defs><linearGradient id={id} x2=".8" y2="1"><stop stopColor="#e7e6db"/><stop offset=".23" stopColor="#71796f"/><stop offset=".5" stopColor="#202a26"/><stop offset=".75" stopColor="#a5aaa0"/><stop offset="1" stopColor="#e5e0cb"/></linearGradient></defs><circle cx="150" cy="150" r="147" fill={`url(#${id})`}/><circle cx="150" cy="150" r="139" fill="#080d0b" stroke="#434b42" strokeWidth="3"/><circle cx="150" cy="150" r="133" fill="var(--gauge-face, #151b17)" stroke="#252f26" strokeWidth="2"/></>
}
export function ClassicTickRing({ min, max, major = 8, warningAt, format }: { min: number; max: number; major?: number; warningAt?: number; format?: (n: number) => string }) {
  return <g fill="var(--cl-primary-bright)" stroke="var(--cl-primary)">{Array.from({length: major * 5 + 1}, (_, i) => {
    const a = -130 + i / (major * 5) * 260, v = min + i / (major * 5) * (max - min), big = i % 5 === 0
    const p = point(a, 122), q = point(a, big ? 106 : 116), t = point(a, 91)
    return <g key={i} style={{ color: warningAt !== undefined && v >= warningAt ? '#cb6451' : undefined }}><line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={warningAt !== undefined && v >= warningAt ? 'currentColor' : undefined} strokeWidth={big ? 2 : 1}/>{big && <text x={t.x} y={t.y + 6} stroke="none" textAnchor="middle" fontSize="19">{format ? format(v) : Math.round(v)}</text>}</g>
  })}</g>
}
export function ClassicNeedle({ angle }: { angle: number }) {
  return <g transform={`rotate(${angle} 150 150)`}><path d="M147 174 L148.4 48 L150 34 L151.6 48 L153 174 Z" fill="#d7a76e"/><circle cx="150" cy="150" r="10" fill="#222d26" stroke="#8a8e7c" strokeWidth="2"/><circle cx="150" cy="150" r="4" fill="#b7b9a6"/></g>
}
export function MechanicalOdometer({ value }: { value: number }) {
  return <g><rect x="93" y="207" width="114" height="27" rx="2" fill="#080d0a" stroke="#66705b"/>{String(Math.floor(value)).padStart(6, '0').slice(-6).split('').map((n,i) => <g key={i}><text key={n} className="rd-odo-roll" x={103 + i * 19} y="227" fill="#e3dbc3" fontFamily="monospace" fontSize="19" textAnchor="middle">{n}</text><line x1={112 + i * 19} y1="209" x2={112 + i * 19} y2="232" stroke="#3c4438"/></g>)}</g>
}
export interface ClassicGaugeProps { value: number; min?: number; max?: number; label?: string; unit?: string; size?: number; warningAt?: number; odometer?: number; major?: number; format?: (n: number) => string; children?: ReactNode }
export function ClassicRoundGauge({ value, min = 0, max = 100, label = '', unit = '', size = 300, warningAt, odometer, major = 8, format, children }: ClassicGaugeProps) {
  const smoothed = useDampedValue(Math.max(min, Math.min(max, value)))
  return <svg className="rd-classic-gauge" width={size} height={size} viewBox="0 0 300 300" role="img" aria-label={`${label} ${value.toFixed(1)} ${unit}`}><ChromeBezel/><ClassicTickRing min={min} max={max} major={major} warningAt={warningAt} format={format}/><text x="150" y="112" textAnchor="middle" fill="var(--cl-primary)" fontSize="13" letterSpacing="2">{label}</text><text x="150" y="193" textAnchor="middle" fill="var(--cl-muted-text)" fontSize="12" letterSpacing="2">{unit}</text>{odometer !== undefined && <MechanicalOdometer value={odometer}/>}<ClassicNeedle angle={-130 + (smoothed - min) / (max - min) * 260}/>{children}</svg>
}
export const ClassicSpeedometer = (p: ClassicGaugeProps) => <ClassicRoundGauge label="ROAD SPEED" unit="km/h" max={200} major={10} {...p}/>
export const ClassicTachometer = (p: ClassicGaugeProps) => <ClassicRoundGauge label="ENGINE" unit="RPM × 1000" max={8} {...p}/>
export const ClassicFuelGauge = (p: ClassicGaugeProps) => <ClassicRoundGauge label="FUEL" max={100} major={4} format={v => v === 0 ? 'E' : v === 100 ? 'F' : v === 50 ? '½' : ''} {...p}/>
export const ClassicTemperatureGauge = (p: ClassicGaugeProps) => <ClassicRoundGauge label="WATER" unit="°C" min={40} max={120} major={4} warningAt={105} {...p}/>
export const ClassicOilPressureGauge = (p: ClassicGaugeProps) => <ClassicRoundGauge label="OIL" unit="bar" max={6} major={3} {...p}/>
export const ClassicVoltageGauge = (p: ClassicGaugeProps) => <ClassicRoundGauge label="BATTERY" unit="V" min={8} max={16} major={4} {...p}/>
export function ClassicWarningLamp({ label, lit, color = '#d35442' }: { label: string; lit: boolean; color?: string }) {
  return <span className={`rd-classic-lamp ${lit ? 'lit' : ''}`}><i style={{ background: lit ? color : '#262d24', boxShadow: lit ? `0 0 6px ${color}` : undefined }}/>{label}</span>
}
