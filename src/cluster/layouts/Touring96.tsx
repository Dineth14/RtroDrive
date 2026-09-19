import { DigitalSpeed } from '../widgets/DigitalSpeed'
import { RpmBar } from '../widgets/RpmBar'
import { RetroGauge } from '../widgets/RetroGauge'
import { WarningLampStrip } from '../widgets/WarningLampStrip'
import { resolveAuxSlot } from '@/utils/auxSlots'
import { useDashboardData } from './useDashboardData'
import { MediaTicker } from './DashboardChrome'

function TripStat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '0 22px', borderLeft: '1px solid var(--cl-grid-line)' }}>
      <span style={{ fontSize: 10, letterSpacing: 2, color: 'var(--cl-muted-text)' }}>{label}</span>
      <span className="tabular-num" style={{ fontSize: 22, color: 'var(--cl-primary)' }}>
        {value} <span style={{ fontSize: 11, color: 'var(--cl-muted-text)' }}>{unit}</span>
      </span>
    </div>
  )
}

export function Touring96() {
  const { telemetry, speedSourceActive, display, vehicle, isPlaying, track } = useDashboardData()
  const [now] = [new Date()]
  const aux = resolveAuxSlot('BOOST', telemetry, vehicle)

  return (
    <div className="rd-screen">
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', height: '100%', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <DigitalSpeed speedKph={telemetry.speedKph.value} source={speedSourceActive} showSource={display.speedSourceMode === 'AUTO'} heightPx={92} />
          <div style={{ flex: 1 }}>
            <RpmBar rpm={telemetry.rpm.value} redlineRpm={vehicle.redlineRpm} segments={40} />
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--cl-grid-line)' }} />

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <TripStat label="ODOMETER" value={Math.round(telemetry.odometerKm.value).toLocaleString()} unit="km" />
          <TripStat label="TRIP A" value={telemetry.tripDistanceKm.value.toFixed(1)} unit="km" />
          <TripStat label="AVG SPEED" value={telemetry.averageSpeedKph.value.toFixed(0)} unit="km/h" />
          <TripStat label="GEAR" value={telemetry.gearPosition.value} unit="" />
          <TripStat label="CLOCK" value={now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })} unit="" />
        </div>

        <div style={{ height: 1, background: 'var(--cl-grid-line)' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 30, flex: 1, alignContent: 'center' }}>
          <RetroGauge label="WATER" value={telemetry.coolantTempC.value} unit="°C" min={20} max={130} displayValue={telemetry.coolantTempC.value.toFixed(0)} available={telemetry.coolantTempC.available} />
          <RetroGauge label={aux.label} value={aux.value} unit={aux.unit} min={aux.key === 'BOOST' ? -1 : 0} max={aux.key === 'BOOST' ? 2 : aux.key === 'ENGINE_LOAD' ? 100 : 130} displayValue={aux.value.toFixed(aux.decimals)} available={aux.available} />
          <RetroGauge label="VOLT" value={telemetry.batteryVoltage.value} unit="V" min={9} max={16} displayValue={telemetry.batteryVoltage.value.toFixed(1)} available={telemetry.batteryVoltage.available} />
          <RetroGauge label="FUEL" value={telemetry.fuelPercent.value} unit="%" min={0} max={100} displayValue={telemetry.fuelPercent.value.toFixed(0)} available={telemetry.fuelPercent.available} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <WarningLampStrip />
        </div>
      </div>

      <MediaTicker visible={display.mediaTickerEnabled && isPlaying} title={track.title} artist={track.artist} />
    </div>
  )
}
