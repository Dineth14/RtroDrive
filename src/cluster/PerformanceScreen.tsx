import { useEffect, useRef, useState } from 'react'
import { useVehicleStore } from '@/state/vehicleStore'
import { useSettingsStore } from '@/state/settingsStore'
import { RetroGauge } from './widgets/RetroGauge'
import { BoostGauge } from './widgets/BoostGauge'
import { resolveAuxSlot } from '@/utils/auxSlots'
import './PerformanceScreen.css'

export function PerformanceScreen() {
  const telemetry = useVehicleStore((s) => s.telemetry)
  const vehicle = useSettingsStore((s) => s.vehicleProfile)
  const speed = telemetry.speedKph.value

  const prevSpeedRef = useRef(speed)
  const startRef = useRef<number | null>(null)
  const [timing, setTiming] = useState(false)
  const [resultMs, setResultMs] = useState<number | null>(null)

  useEffect(() => {
    const prev = prevSpeedRef.current
    if (prev < 0.5 && speed >= 0.5 && !timing) {
      startRef.current = performance.now()
      setTiming(true)
      setResultMs(null)
    }
    if (timing && speed >= 100) {
      if (startRef.current !== null) setResultMs(performance.now() - startRef.current)
      setTiming(false)
      startRef.current = null
    }
    if (timing && speed < prev - 8) {
      setTiming(false)
      startRef.current = null
    }
    prevSpeedRef.current = speed
  }, [speed, timing])

  const aux = resolveAuxSlot('BOOST', telemetry, vehicle)

  return (
    <div className="rd-screen">
      <div className="rd-perf">
        <div className="rd-section-title" style={{ marginTop: 8 }}>
          PERFORMANCE
        </div>

        {vehicle.isTurbocharged ? (
          <BoostGauge
            valueBar={telemetry.boostBar.value}
            peakBar={telemetry.maxBoostBar.value}
            unit={vehicle.boostUnit}
            maxBar={Math.max(1.6, vehicle.maxBoostBar * 1.2)}
            warningBar={vehicle.boostWarningBar}
            criticalBar={vehicle.boostCriticalBar}
            available={telemetry.boostBar.available}
          />
        ) : (
          <RetroGauge label={aux.label} value={aux.value} unit={aux.unit} min={0} max={aux.key === 'ENGINE_LOAD' ? 100 : 130} displayValue={aux.value.toFixed(aux.decimals)} available={aux.available} />
        )}

        <div className="rd-perf-grid">
          <RetroGauge label="RPM" value={telemetry.rpm.value} unit="" min={0} max={vehicle.redlineRpm + 500} displayValue={String(Math.round(telemetry.rpm.value))} available />
          <RetroGauge label="THROTTLE" value={telemetry.throttlePercent.value} unit="%" min={0} max={100} displayValue={telemetry.throttlePercent.value.toFixed(0)} available={telemetry.throttlePercent.available} />
          <RetroGauge label="LOAD" value={telemetry.engineLoadPercent.value} unit="%" min={0} max={100} displayValue={telemetry.engineLoadPercent.value.toFixed(0)} available={telemetry.engineLoadPercent.available} />
          <RetroGauge label="IAT" value={telemetry.intakeTempC.value} unit="°C" min={0} max={90} displayValue={telemetry.intakeTempC.value.toFixed(0)} available={telemetry.intakeTempC.available} />
          <RetroGauge label="COOLANT" value={telemetry.coolantTempC.value} unit="°C" min={20} max={130} displayValue={telemetry.coolantTempC.value.toFixed(0)} available={telemetry.coolantTempC.available} />
        </div>

        <div className="rd-perf-peaks">
          <div className="rd-perf-peak">
            <span className="rd-perf-peak-label">MAX BOOST</span>
            <span className="rd-perf-peak-value tabular-num">{telemetry.maxBoostBar.value.toFixed(2)} bar</span>
          </div>
          <div className="rd-perf-peak">
            <span className="rd-perf-peak-label">MAX RPM</span>
            <span className="rd-perf-peak-value tabular-num">{Math.round(telemetry.maxRpm.value)}</span>
          </div>
          <div className="rd-perf-peak">
            <span className="rd-perf-peak-label">MAX COOLANT</span>
            <span className="rd-perf-peak-value tabular-num">{telemetry.maxCoolantC.value.toFixed(0)}°C</span>
          </div>
        </div>

        <div className="rd-perf-accel">
          <span className="rd-perf-accel-label">0–100 KM/H</span>
          <span className="rd-perf-accel-value tabular-num">
            {resultMs !== null ? `${(resultMs / 1000).toFixed(2)}s` : timing ? '...' : '--'}
          </span>
          <span className="rd-perf-accel-note">SIMULATION TIMER</span>
        </div>
      </div>
    </div>
  )
}
