import { DigitalSpeed } from '../widgets/DigitalSpeed'
import { RpmBar } from '../widgets/RpmBar'
import { BoostGauge } from '../widgets/BoostGauge'
import { RetroGauge } from '../widgets/RetroGauge'
import { WarningLampStrip } from '../widgets/WarningLampStrip'
import { resolveAuxSlot } from '@/utils/auxSlots'
import { useDashboardData } from './useDashboardData'
import { OdoTripClockRow, GpsMiniIndicator, MediaTicker } from './DashboardChrome'

export function JdmGt93() {
  const { telemetry, speedSourceActive, connections, display, vehicle, isPlaying, track } = useDashboardData()

  const substituteAux = resolveAuxSlot('BOOST', telemetry, vehicle)

  return (
    <div className="rd-screen">
      <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 11, letterSpacing: 2, color: 'var(--cl-muted-text)' }}>{vehicle.nickname}</span>
            <GpsMiniIndicator telemetry={telemetry} gpsFix={connections.gps === 'FIX'} />
          </div>
          <DigitalSpeed speedKph={telemetry.speedKph.value} source={speedSourceActive} showSource={display.speedSourceMode === 'AUTO'} heightPx={88} />
        </div>

        <RpmBar rpm={telemetry.rpm.value} redlineRpm={vehicle.redlineRpm} segments={56} />

        <div style={{ padding: '2px 40px' }}>
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
            <RetroGauge
              label={substituteAux.label}
              value={substituteAux.value}
              unit={substituteAux.unit}
              min={0}
              max={substituteAux.key === 'ENGINE_LOAD' ? 100 : 130}
              displayValue={substituteAux.value.toFixed(substituteAux.decimals)}
              available={substituteAux.available}
            />
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          <RetroGauge label="WATER" value={telemetry.coolantTempC.value} unit="°C" min={20} max={130} displayValue={telemetry.coolantTempC.value.toFixed(0)} available={telemetry.coolantTempC.available} />
          <RetroGauge label="OIL P" value={telemetry.oilPressureBar.value} unit="bar" min={0} max={6} displayValue={telemetry.oilPressureBar.value.toFixed(1)} available={telemetry.oilPressureBar.available} />
          <RetroGauge label="OIL T" value={telemetry.oilTempC.value} unit="°C" min={20} max={140} displayValue={telemetry.oilTempC.value.toFixed(0)} available={telemetry.oilTempC.available} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          <RetroGauge label="VOLT" value={telemetry.batteryVoltage.value} unit="V" min={9} max={16} displayValue={telemetry.batteryVoltage.value.toFixed(1)} available={telemetry.batteryVoltage.available} />
          <RetroGauge label="IAT" value={telemetry.intakeTempC.value} unit="°C" min={0} max={90} displayValue={telemetry.intakeTempC.value.toFixed(0)} available={telemetry.intakeTempC.available} />
          <RetroGauge label="FUEL" value={telemetry.fuelPercent.value} unit="%" min={0} max={100} displayValue={telemetry.fuelPercent.value.toFixed(0)} available={telemetry.fuelPercent.available} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <WarningLampStrip />
          <div style={{ maxWidth: 320, flex: 1, marginLeft: 24 }}>
            <OdoTripClockRow telemetry={telemetry} />
          </div>
        </div>
      </div>

      <MediaTicker visible={display.mediaTickerEnabled && isPlaying} title={track.title} artist={track.artist} />
    </div>
  )
}
