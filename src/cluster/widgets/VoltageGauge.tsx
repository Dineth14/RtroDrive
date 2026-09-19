import { RetroGauge, type GaugeZone } from './RetroGauge'

export interface VoltageGaugeProps {
  voltage: number
  available?: boolean
  lowThreshold?: number
  criticalThreshold?: number
}

export function VoltageGauge({ voltage, available = true, lowThreshold = 12.5, criticalThreshold = 11.5 }: VoltageGaugeProps) {
  const zoneFor = (): GaugeZone => {
    if (voltage <= criticalThreshold) return 'critical'
    if (voltage <= lowThreshold) return 'caution'
    return 'normal'
  }
  return (
    <RetroGauge
      label="VOLT"
      value={voltage}
      unit="V"
      min={9}
      max={16}
      displayValue={voltage.toFixed(1)}
      zoneFor={zoneFor}
      available={available}
    />
  )
}
