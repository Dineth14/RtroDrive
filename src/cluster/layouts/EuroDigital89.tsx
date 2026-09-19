import { ArcTachometer } from '../widgets/ArcTachometer'
import { DigitalSpeed } from '../widgets/DigitalSpeed'
import { RetroGauge } from '../widgets/RetroGauge'
import { WarningLampStrip } from '../widgets/WarningLampStrip'
import { useDashboardData } from './useDashboardData'
import { OdoTripClockRow, MediaTicker } from './DashboardChrome'

export function EuroDigital89() {
  const { telemetry, speedSourceActive, display, warnings, vehicle, isPlaying, track } = useDashboardData()

  return (
    <div className="rd-screen">
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', gap: 6 }}>
        <div style={{ position: 'relative' }}>
          <ArcTachometer rpm={telemetry.rpm.value} redlineRpm={vehicle.redlineRpm} size={380} />
          <div style={{ position: 'absolute', left: '50%', bottom: 6, transform: 'translateX(-50%)' }}>
            <DigitalSpeed speedKph={telemetry.speedKph.value} source={speedSourceActive} showSource={display.speedSourceMode === 'AUTO'} heightPx={64} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 60, width: '100%', maxWidth: 640, justifyContent: 'center', marginTop: 4 }}>
          <div style={{ width: 220 }}>
            <RetroGauge
              label="FUEL"
              value={telemetry.fuelPercent.value}
              unit="%"
              min={0}
              max={100}
              displayValue={telemetry.fuelPercent.value.toFixed(0)}
              available={telemetry.fuelPercent.available}
              zoneFor={() => (telemetry.fuelPercent.value <= warnings.fuelLowPercent ? 'caution' : 'normal')}
            />
          </div>
          <div style={{ width: 220 }}>
            <RetroGauge
              label="TEMP"
              value={telemetry.coolantTempC.value}
              unit="°C"
              min={20}
              max={130}
              displayValue={telemetry.coolantTempC.value.toFixed(0)}
              available={telemetry.coolantTempC.available}
              zoneFor={() =>
                telemetry.coolantTempC.value >= warnings.coolantCriticalC ? 'critical' : telemetry.coolantTempC.value >= warnings.coolantWarningC ? 'caution' : 'normal'
              }
            />
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: 640, marginTop: 8 }}>
          <OdoTripClockRow telemetry={telemetry} />
        </div>

        <div style={{ marginTop: 'auto', paddingBottom: 4 }}>
          <WarningLampStrip />
        </div>
      </div>

      <MediaTicker visible={display.mediaTickerEnabled && isPlaying} title={track.title} artist={track.artist} />
    </div>
  )
}
