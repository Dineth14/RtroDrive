import { RetroGauge, type GaugeZone } from './RetroGauge'

export interface TemperatureGaugeProps {
  label: string
  valueC: number
  available?: boolean
  warningC?: number
  criticalC?: number
  min?: number
  max?: number
}

export function TemperatureGauge({
  label,
  valueC,
  available = true,
  warningC = 102,
  criticalC = 112,
  min = 20,
  max = 130,
}: TemperatureGaugeProps) {
  const zoneFor = (): GaugeZone => {
    if (valueC >= criticalC) return 'critical'
    if (valueC >= warningC) return 'caution'
    return 'normal'
  }
  return (
    <RetroGauge
      label={label}
      value={valueC}
      unit="°C"
      min={min}
      max={max}
      displayValue={valueC.toFixed(0)}
      zoneFor={zoneFor}
      available={available}
    />
  )
}
