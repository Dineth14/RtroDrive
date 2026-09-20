import { useVehicleStore } from '@/state/vehicleStore'
import { useSettingsStore } from '@/state/settingsStore'
import './WarningLampStrip.css'

type LampId = 'ENGINE' | 'OIL' | 'BATTERY' | 'TEMP' | 'BRAKE' | 'ABS' | 'BOOST' | 'FUEL' | 'TRACTION'

function Icon({ id }: { id: LampId }) {
  switch (id) {
    case 'BOOST': return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="8"/><path d="M12 12 L18 7 M4 20 H20"/></svg>
    case 'FUEL': return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 21 V4 H14 V21 M2 21 H16 M5 6 H12 V11 H5 M14 10 H17 V18 Q21 21 21 17 V8 L17 4"/></svg>
    case 'TRACTION': return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 13 L7 5 H17 L20 13 Z M6 13 V16 M18 13 V16 M6 18 Q11 20 5 23 M18 18 Q13 20 19 23"/></svg>
    case 'ENGINE':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="9" width="13" height="9" rx="1" />
          <path d="M16 12h3l2-3v6l-2-3" />
          <path d="M6 9V6h3v3M10 9V6h3v3" />
          <path d="M3 13h13" />
        </svg>
      )
    case 'OIL':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 3c3 4 6 7.5 6 11a6 6 0 1 1-12 0c0-3.5 3-7 6-11z" />
          <path d="M12 12a3 3 0 0 0 3 3" strokeWidth="1.2" />
        </svg>
      )
    case 'BATTERY':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="8" width="18" height="11" rx="1" />
          <path d="M8 8V6M16 8V6" />
          <path d="M8 13h2M9 12v2" />
          <path d="M14 13h3" />
        </svg>
      )
    case 'TEMP':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 4a2 2 0 0 1 2 2v8.5a4 4 0 1 1-4 0V6a2 2 0 0 1 2-2z" />
          <path d="M12 14v3" />
        </svg>
      )
    case 'BRAKE':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v7" />
          <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'ABS':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4">
          <circle cx="12" cy="12" r="9" />
          <text x="12" y="15.5" fontSize="7.5" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="inherit">
            ABS
          </text>
        </svg>
      )
  }
}

export interface WarningLampStripProps {
  forceAllLit?: boolean
  size?: 'sm' | 'md'
}

export function WarningLampStrip({ forceAllLit = false }: WarningLampStripProps) {
  const warnings = useVehicleStore((s) => s.warnings)
  const dtcs = useVehicleStore((s) => s.dtcs)
  const telemetry = useVehicleStore((s) => s.telemetry)
  const thresholds = useSettingsStore((s) => s.warnings)

  const engineLit = forceAllLit || dtcs.some((d) => d.status === 'ACTIVE')
  const oilLit = forceAllLit || warnings.some((w) => w.source === 'oil')
  const batteryLit = forceAllLit || warnings.some((w) => w.source === 'battery')
  const tempLit = forceAllLit || telemetry.coolantTempC.value > thresholds.coolantWarningC
  const brakeLit = forceAllLit
  const absLit = forceAllLit

  const lamps: { id: LampId; lit: boolean; color: string }[] = [
    { id:'BOOST',lit:forceAllLit||warnings.some(w=>w.source==='boost'),color:'var(--cl-critical-red)' },
    { id:'FUEL',lit:forceAllLit||telemetry.fuelPercent.value<thresholds.fuelLowPercent,color:'var(--cl-warning-amber)' },
    { id:'TRACTION',lit:forceAllLit,color:'var(--cl-warning-amber)' },
    { id: 'ENGINE', lit: engineLit, color: 'var(--cl-warning-amber)' },
    { id: 'OIL', lit: oilLit, color: 'var(--cl-critical-red)' },
    { id: 'BATTERY', lit: batteryLit, color: 'var(--cl-warning-amber)' },
    { id: 'TEMP', lit: tempLit, color: 'var(--cl-critical-red)' },
    { id: 'BRAKE', lit: brakeLit, color: 'var(--cl-critical-red)' },
    { id: 'ABS', lit: absLit, color: 'var(--cl-warning-amber)' },
  ]

  return (
    <div className="rd-lampstrip">
      {lamps.map((l) => (
        <div key={l.id} className={`rd-lamp${l.lit ? ' lit' : ''}`} style={{ color: l.lit ? l.color : 'var(--cl-grid-line)' }}>
          <div className="rd-lamp-icon" style={l.lit ? { filter: `drop-shadow(0 0 4px ${l.color})` } : undefined}>
            <Icon id={l.id} />
          </div>
          <span className="rd-lamp-label">{l.id}</span>
        </div>
      ))}
    </div>
  )
}
