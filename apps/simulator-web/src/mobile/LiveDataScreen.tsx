import { useEffect, useRef, useState } from 'react'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import { useVehicleStore } from '@/state/vehicleStore'
import './LiveDataScreen.css'
import { useSettingsStore } from '@/state/settingsStore'
import { getVisualProfile } from '@/vehicleProfiles/profiles'
import { ClassicRoundGauge, ClassicSpeedometer, ClassicTachometer, ClassicFuelGauge, ClassicTemperatureGauge, ClassicVoltageGauge } from '@/cluster/gauges/classic/ClassicGauges'
import { BoostGauge } from '@/cluster/widgets/BoostGauge'

interface CardDef {
  key: string
  label: string
  unit: string
  get: () => number
  color: string
  decimals?: number
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const points = data.map((v, i) => ({ i, v }))
  return (
    <div style={{ height: 36 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function LiveDataScreen() {
  const vehicle=useSettingsStore(s=>s.vehicleProfile)
  const historyRef = useRef<Record<string, number[]>>({})
  const [, forceTick] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      const t = useVehicleStore.getState().telemetry
      const samples: Record<string, number> = {
        rpm: t.rpm.value,
        speed: t.speedKph.value,
        coolant: t.coolantTempC.value,
        voltage: t.batteryVoltage.value,
        load: t.engineLoadPercent.value,
        throttle: t.throttlePercent.value,
        fuel: t.fuelPercent.value,
        stft: t.shortFuelTrimPercent.value,
      }
      for (const [key, val] of Object.entries(samples)) {
        const arr = historyRef.current[key] ?? []
        arr.push(val)
        if (arr.length > 40) arr.shift()
        historyRef.current[key] = arr
      }
      forceTick((n) => n + 1)
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  const t = useVehicleStore((s) => s.telemetry)

  const cards: CardDef[] = [
    { key: 'rpm', label: 'RPM', unit: '', get: () => t.rpm.value, color: '#8fcb83', decimals: 0 },
    { key: 'speed', label: 'Speed', unit: 'km/h', get: () => t.speedKph.value, color: '#8fcb83', decimals: 0 },
    { key: 'coolant', label: 'Coolant', unit: '°C', get: () => t.coolantTempC.value, color: '#e0a33a', decimals: 0 },
    { key: 'voltage', label: 'Voltage', unit: 'V', get: () => t.batteryVoltage.value, color: '#d7a94a', decimals: 1 },
    { key: 'load', label: 'Engine Load', unit: '%', get: () => t.engineLoadPercent.value, color: '#7fc7c9', decimals: 0 },
    { key: 'throttle', label: 'Throttle', unit: '%', get: () => t.throttlePercent.value, color: '#7fc7c9', decimals: 0 },
    { key: 'fuel', label: 'Fuel', unit: '%', get: () => t.fuelPercent.value, color: '#8fcb83', decimals: 0 },
    { key: 'stft', label: 'STFT', unit: '%', get: () => t.shortFuelTrimPercent.value, color: '#e06a5a', decimals: 1 },
  ]

  if(getVisualProfile(vehicle).era==='CLASSIC_60') return <div className="phone-classic-live"><ClassicSpeedometer value={t.speedKph.value}/><ClassicTachometer value={t.rpm.value/1000} warningAt={vehicle.redlineRpm/1000}/><ClassicTemperatureGauge value={t.coolantTempC.value}/><ClassicFuelGauge value={t.fuelPercent.value}/><ClassicVoltageGauge value={t.batteryVoltage.value}/><ClassicRoundGauge label="LOAD" unit="%" value={t.engineLoadPercent.value}/></div>
  return (
    <div className="rd-live-grid">
      {vehicle.isTurbocharged&&<div className="phone-live-boost"><BoostGauge valueBar={t.boostBar.value} unit={vehicle.boostUnit} maxBar={Math.max(1.5,vehicle.maxBoostBar)} warningBar={vehicle.boostWarningBar} criticalBar={vehicle.boostCriticalBar}/></div>}
      {cards.map((c) => (
        <div className="rd-live-card" key={c.key}>
          <div className="rd-live-card-label">{c.label}</div>
          <div className="rd-live-card-value">
            {c.get().toFixed(c.decimals ?? 0)} <span style={{ fontSize: 11, color: '#6c786f' }}>{c.unit}</span>
          </div>
          <Sparkline data={historyRef.current[c.key] ?? []} color={c.color} />
        </div>
      ))}
    </div>
  )
}
