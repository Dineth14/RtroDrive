import { useSettingsStore } from '@/state/settingsStore'
import { SliderRow } from './MobileControls'
import './mobile.css'

const RECOMMENDED = {
  coolantWarningC: 102,
  coolantCriticalC: 112,
  voltageLowRunningV: 12.5,
  fuelLowPercent: 15,
}

export function WarningSettingsScreen() {
  const warnings = useSettingsStore((s) => s.warnings)
  const update = useSettingsStore((s) => s.updateWarningThresholds)

  const dangerousCoolant = warnings.coolantCriticalC > 120
  const dangerousVoltage = warnings.voltageLowRunningV < 11.8

  return (
    <div>
      <div className="rd-m-card">
        <div className="rd-m-card-title">COOLANT (RECOMMENDED: {RECOMMENDED.coolantWarningC}&deg; / {RECOMMENDED.coolantCriticalC}&deg;C)</div>
        <SliderRow label="Warning" value={warnings.coolantWarningC} min={90} max={115} unit="°C" onChange={(v) => update({ coolantWarningC: v })} />
        <SliderRow label="Critical" value={warnings.coolantCriticalC} min={100} max={130} unit="°C" onChange={(v) => update({ coolantCriticalC: v })} />
        {dangerousCoolant && <div className="rd-m-driving-warning">Critical threshold set unusually high — engine damage risk may go undetected.</div>}
      </div>

      <div className="rd-m-card">
        <div className="rd-m-card-title">VOLTAGE (RECOMMENDED: {RECOMMENDED.voltageLowRunningV}V running)</div>
        <SliderRow label="Low (running)" value={warnings.voltageLowRunningV} min={11} max={13.5} step={0.1} unit="V" onChange={(v) => update({ voltageLowRunningV: v })} />
        <SliderRow label="Critical" value={warnings.voltageCriticalV} min={9} max={12.5} step={0.1} unit="V" onChange={(v) => update({ voltageCriticalV: v })} />
        {dangerousVoltage && <div className="rd-m-driving-warning">Low-voltage threshold set very low — charging faults may go unnoticed.</div>}
      </div>

      <div className="rd-m-card">
        <div className="rd-m-card-title">FUEL (RECOMMENDED: {RECOMMENDED.fuelLowPercent}%)</div>
        <SliderRow label="Low fuel" value={warnings.fuelLowPercent} min={5} max={30} unit="%" onChange={(v) => update({ fuelLowPercent: v })} />
      </div>
    </div>
  )
}
