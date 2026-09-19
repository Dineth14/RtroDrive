import { useVehicleStore } from '@/state/vehicleStore'
import { useSettingsStore } from '@/state/settingsStore'
import { useMediaStore, TRACKS } from '@/state/mediaStore'
import { DigitalSpeed } from './widgets/DigitalSpeed'
import { RpmBar } from './widgets/RpmBar'
import { TemperatureGauge } from './widgets/TemperatureGauge'
import { FuelGauge } from './widgets/FuelGauge'
import { VoltageGauge } from './widgets/VoltageGauge'
import { RetroGauge } from './widgets/RetroGauge'
import './DashboardScreen.css'

export function DashboardScreen() {
  const telemetry = useVehicleStore((s) => s.telemetry)
  const speedSourceActive = useVehicleStore((s) => s.speedSourceActive)
  const display = useSettingsStore((s) => s.display)
  const warnings = useSettingsStore((s) => s.warnings)
  const vehicle = useSettingsStore((s) => s.vehicleProfile)
  const isPlaying = useMediaStore((s) => s.isPlaying)
  const currentTrackId = useMediaStore((s) => s.currentTrackId)
  const track = TRACKS.find((t) => t.id === currentTrackId) ?? TRACKS[0]

  return (
    <div className="rd-screen">
      <div className="rd-dash">
        <div className="rd-dash-top">
          <div className="rd-dash-top-side">
            <TemperatureGauge
              label="WATER"
              valueC={telemetry.coolantTempC.value}
              available={telemetry.coolantTempC.available}
              warningC={warnings.coolantWarningC}
              criticalC={warnings.coolantCriticalC}
            />
          </div>
          <DigitalSpeed
            speedKph={telemetry.speedKph.value}
            source={speedSourceActive}
            showSource={display.speedSourceMode === 'AUTO'}
          />
          <div className="rd-dash-top-side right">
            <FuelGauge percent={telemetry.fuelPercent.value} lowThreshold={warnings.fuelLowPercent} available={telemetry.fuelPercent.available} />
          </div>
        </div>

        <div className="rd-dash-mid">
          <RpmBar rpm={telemetry.rpm.value} redlineRpm={vehicle.redlineRpm} />
        </div>

        <div className="rd-dash-bottom">
          <RetroGauge
            label="OIL"
            value={telemetry.oilPressureBar.value}
            unit="bar"
            min={0}
            max={6}
            displayValue={telemetry.oilPressureBar.value.toFixed(1)}
            available={telemetry.oilPressureBar.available}
            zoneFor={(r) => (telemetry.oilPressureBar.value < 0.8 ? 'critical' : r < 0.15 ? 'caution' : 'normal')}
          />
          <VoltageGauge
            voltage={telemetry.batteryVoltage.value}
            available={telemetry.batteryVoltage.available}
            lowThreshold={warnings.voltageLowRunningV}
            criticalThreshold={warnings.voltageCriticalV}
          />
          <RetroGauge
            label="INTAKE"
            value={telemetry.intakeTempC.value}
            unit="°C"
            min={0}
            max={90}
            displayValue={telemetry.intakeTempC.value.toFixed(0)}
            available={telemetry.intakeTempC.available}
          />
          <RetroGauge
            label="LOAD"
            value={telemetry.engineLoadPercent.value}
            unit="%"
            min={0}
            max={100}
            displayValue={telemetry.engineLoadPercent.value.toFixed(0)}
            available={telemetry.engineLoadPercent.available}
          />
        </div>
      </div>

      {display.mediaTickerEnabled && isPlaying && (
        <div className="rd-dash-ticker">
          <span>&#9835;</span>
          <span>
            {track.title} — {track.artist}
          </span>
        </div>
      )}
    </div>
  )
}
