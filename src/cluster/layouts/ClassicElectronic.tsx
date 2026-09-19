import { SevenSegmentGroup } from '../widgets/SevenSegment'
import { RetroGauge } from '../widgets/RetroGauge'
import { WarningLampStrip } from '../widgets/WarningLampStrip'
import { useDashboardData } from './useDashboardData'
import { MediaTicker } from './DashboardChrome'

function NumericBlock({ label, text, color, heightPx = 46 }: { label: string; text: string; color: string; heightPx?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, letterSpacing: 3, color: 'var(--cl-muted-text)' }}>{label}</span>
      <SevenSegmentGroup text={text} litColor={color} heightPx={heightPx} gapPx={5} />
    </div>
  )
}

export function ClassicElectronic() {
  const { telemetry, vehicle, warnings, display, isPlaying, track } = useDashboardData()

  const speedTxt = String(Math.round(telemetry.speedKph.value)).padStart(3, '0').slice(-3)
  const rpmTxt = String(Math.round(telemetry.rpm.value)).padStart(4, '0').slice(-4)
  const voltTxt = telemetry.batteryVoltage.value.toFixed(1)
  const tempTxt = String(Math.round(telemetry.coolantTempC.value)).padStart(3, '0').slice(-3)

  const tempColor =
    telemetry.coolantTempC.value >= warnings.coolantCriticalC
      ? 'var(--cl-critical-red)'
      : telemetry.coolantTempC.value >= warnings.coolantWarningC
        ? 'var(--cl-warning-amber)'
        : 'var(--cl-primary-bright)'
  const voltColor = telemetry.batteryVoltage.value < warnings.voltageLowRunningV ? 'var(--cl-warning-amber)' : 'var(--cl-primary-bright)'

  return (
    <div className="rd-screen">
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', gap: 22 }}>
        <span style={{ fontSize: 12, letterSpacing: 6, color: 'var(--cl-muted-text)' }}>{vehicle.nickname}</span>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px 60px', alignItems: 'center' }}>
          <NumericBlock label="SPEED KM/H" text={speedTxt} color="var(--cl-primary-bright)" heightPx={72} />
          <NumericBlock label="ENGINE RPM" text={rpmTxt} color="var(--cl-primary-bright)" heightPx={72} />
          <NumericBlock label="VOLTS" text={voltTxt} color={voltColor} heightPx={48} />
          <NumericBlock label="COOLANT °C" text={tempTxt} color={tempColor} heightPx={48} />
        </div>

        <div style={{ width: '100%', maxWidth: 420 }}>
          <RetroGauge
            label="FUEL"
            value={telemetry.fuelPercent.value}
            unit="%"
            min={0}
            max={100}
            displayValue={telemetry.fuelPercent.value.toFixed(0)}
            available={telemetry.fuelPercent.available}
            zoneFor={() => (telemetry.fuelPercent.value <= warnings.fuelLowPercent ? 'caution' : 'normal')}
            segments={24}
          />
        </div>

        <div style={{ fontSize: 12, letterSpacing: 2, color: 'var(--cl-muted-text)' }}>
          ODO {Math.round(telemetry.odometerKm.value).toLocaleString()} km &nbsp;&nbsp;·&nbsp;&nbsp; TRIP {telemetry.tripDistanceKm.value.toFixed(1)} km
        </div>

        <div style={{ marginTop: 'auto', paddingBottom: 6 }}>
          <WarningLampStrip />
        </div>
      </div>

      <MediaTicker visible={display.mediaTickerEnabled && isPlaying} title={track.title} artist={track.artist} />
    </div>
  )
}
