import { RetroGauge, type GaugeZone } from './RetroGauge'

export interface FuelGaugeProps {
  percent: number
  lowThreshold?: number
  available?: boolean
}

export function FuelGauge({ percent, lowThreshold = 15, available = true }: FuelGaugeProps) {
  const zoneFor = (): GaugeZone => (percent <= lowThreshold ? 'caution' : 'normal')
  return (
    <RetroGauge
      label="FUEL"
      value={percent}
      unit="%"
      min={0}
      max={100}
      displayValue={percent.toFixed(0)}
      zoneFor={zoneFor}
      available={available}
    />
  )
}
