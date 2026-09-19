import { DigitalSpeed } from '../widgets/DigitalSpeed'
import { VerticalBarGauge } from '../widgets/VerticalBarGauge'
import { WarningLampStrip } from '../widgets/WarningLampStrip'
import { CompassRose } from '../widgets/CompassRose'
import { useDashboardData } from './useDashboardData'
import { OdoTripClockRow, MediaTicker } from './DashboardChrome'
import { useExpeditionStore } from '@/state/expeditionStore'
import { resolveAuxSlot } from '@/utils/auxSlots'
import './OffroadLayouts.css'

export function Utility80({ testValue }: { testValue?: number }) {
  const { telemetry: t, display, vehicle, isPlaying, track } = useDashboardData()
  const exp = useExpeditionStore()
  const oil = resolveAuxSlot('OIL_PRESSURE', t, vehicle)

  return (
    <>
      <div className="rd-utility80">
        <header className="rd-utility80-head">
          <span>RETRODRIVE</span>
          <b>UTILITY 80</b>
          <span>{vehicle.nickname}</span>
        </header>

        <div className="rd-utility80-main">
          <div className="rd-utility80-block rd-utility80-speed">
            <DigitalSpeed speedKph={testValue === undefined ? t.speedKph.value : 888} unit={vehicle.speedUnit === 'MPH' ? 'mph' : 'km/h'} heightPx={74} />
          </div>
          <div className="rd-utility80-block rd-utility80-compass">
            <CompassRose headingDeg={testValue === undefined ? t.headingDeg.value : 0} size={104} label="HEADING" />
          </div>
          <div className="rd-utility80-bars">
            <VerticalBarGauge label="FUEL" value={testValue === undefined ? t.fuelPercent.value : testValue * 100} min={0} max={100} unit="%" heightPx={104} segments={12} />
            <VerticalBarGauge label="COOLANT" value={testValue === undefined ? t.coolantTempC.value : testValue * 130} min={40} max={130} displayValue={(testValue === undefined ? t.coolantTempC.value : testValue * 130).toFixed(0)} unit="C" heightPx={104} segments={12} />
            <VerticalBarGauge label="BATTERY" value={testValue === undefined ? t.batteryVoltage.value : 8 + testValue * 8} min={9} max={16} displayValue={(testValue === undefined ? t.batteryVoltage.value : 8 + testValue * 8).toFixed(1)} unit="V" heightPx={104} segments={12} />
            <VerticalBarGauge label={oil.label} value={testValue === undefined ? oil.value : testValue * 6} min={0} max={oil.key === 'OIL_PRESSURE' ? 6 : 140} displayValue={(testValue === undefined ? oil.value : testValue * 6).toFixed(1)} unit={oil.unit} heightPx={104} segments={12} />
          </div>
        </div>

        <div className="rd-utility80-status">
          <span>4WD {exp.fourWheelDrive}</span>
          <span>{exp.lowRangeActive ? 'LOW RANGE' : 'HIGH RANGE'}</span>
          <span>{exp.diffLock.front || exp.diffLock.rear || exp.diffLock.center ? 'DIFF LOCK ENGAGED' : 'DIFF LOCK OFF'}</span>
          <span>ALT {t.altitudeM.available ? `${Math.round(t.altitudeM.value)}m` : '--'}</span>
        </div>

        <footer className="rd-utility80-footer">
          <WarningLampStrip forceAllLit={testValue !== undefined} />
          <OdoTripClockRow telemetry={t} />
        </footer>
      </div>
      <MediaTicker visible={display.mediaTickerEnabled && isPlaying} title={track.title} artist={track.artist} />
    </>
  )
}
