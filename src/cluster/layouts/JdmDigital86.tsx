import { DigitalSpeed } from '../widgets/DigitalSpeed'
import { RpmBar } from '../widgets/RpmBar'
import { VerticalBarGauge } from '../widgets/VerticalBarGauge'
import { RetroGauge } from '../widgets/RetroGauge'
import { WarningLampStrip } from '../widgets/WarningLampStrip'
import { useDashboardData } from './useDashboardData'
import { OdoTripClockRow, GpsMiniIndicator, MediaTicker } from './DashboardChrome'

export function JdmDigital86() {
  const { telemetry, speedSourceActive, connections, display, warnings, vehicle, isPlaying, track } = useDashboardData()

  return (
    <div className="rd-screen">
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', height: '100%', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 110px', alignItems: 'center', gap: 16 }}>
          <VerticalBarGauge
            label="FUEL"
            value={telemetry.fuelPercent.value}
            min={0}
            max={100}
            unit="%"
            displayValue={telemetry.fuelPercent.value.toFixed(0)}
            available={telemetry.fuelPercent.available}
            zoneFor={(r) => (telemetry.fuelPercent.value <= warnings.fuelLowPercent ? 'caution' : r < 0 ? 'normal' : 'normal')}
            heightPx={132}
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <DigitalSpeed speedKph={telemetry.speedKph.value} source={speedSourceActive} showSource={display.speedSourceMode === 'AUTO'} heightPx={104} />
            <GpsMiniIndicator telemetry={telemetry} gpsFix={connections.gps === 'FIX'} />
          </div>
          <VerticalBarGauge
            label="WATER"
            value={telemetry.coolantTempC.value}
            min={20}
            max={130}
            unit="°C"
            displayValue={telemetry.coolantTempC.value.toFixed(0)}
            available={telemetry.coolantTempC.available}
            zoneFor={() =>
              telemetry.coolantTempC.value >= warnings.coolantCriticalC ? 'critical' : telemetry.coolantTempC.value >= warnings.coolantWarningC ? 'caution' : 'normal'
            }
            heightPx={132}
          />
        </div>

        <RpmBar rpm={telemetry.rpm.value} redlineRpm={vehicle.redlineRpm} segments={56} />

        <div style={{ display: 'flex', justifyContent: 'center', padding: '2px 0' }}>
          <WarningLampStrip />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24 }}>
          <div style={{ display: 'flex', gap: 28, flex: 1 }}>
            <div style={{ width: 130 }}>
              <RetroGauge label="VOLT" value={telemetry.batteryVoltage.value} unit="V" min={9} max={16} displayValue={telemetry.batteryVoltage.value.toFixed(1)} available={telemetry.batteryVoltage.available} />
            </div>
            <div style={{ width: 130 }}>
              <RetroGauge label="OIL" value={telemetry.oilPressureBar.value} unit="bar" min={0} max={6} displayValue={telemetry.oilPressureBar.value.toFixed(1)} available={telemetry.oilPressureBar.available} />
            </div>
          </div>
          <div style={{ flex: 1, maxWidth: 420 }}>
            <OdoTripClockRow telemetry={telemetry} />
          </div>
        </div>
      </div>

      <MediaTicker visible={display.mediaTickerEnabled && isPlaying} title={track.title} artist={track.artist} />
    </div>
  )
}
