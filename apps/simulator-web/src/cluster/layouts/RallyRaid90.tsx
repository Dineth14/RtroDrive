import { DigitalSpeed } from '../widgets/DigitalSpeed'
import { BoostGauge } from '../widgets/BoostGauge'
import { WarningLampStrip } from '../widgets/WarningLampStrip'
import { CompassRose } from '../widgets/CompassRose'
import { useDashboardData } from './useDashboardData'
import { OdoTripClockRow, MediaTicker } from './DashboardChrome'
import { useExpeditionStore } from '@/state/expeditionStore'
import './OffroadLayouts.css'

export function RallyRaid90({ testValue }: { testValue?: number }) {
  const { telemetry: t, display, vehicle, isPlaying, track } = useDashboardData()
  const exp = useExpeditionStore()
  const pitch = testValue !== undefined ? 0 : exp.pitchDeg
  const roll = testValue !== undefined ? 0 : exp.rollDeg

  return (
    <>
      <div className="rd-rally">
        <header className="rd-rally-head">
          <span>RETRODRIVE / <b>RALLY COMPUTER</b></span>
          <span>{vehicle.nickname}</span>
          <span className="rd-rally-4wd">{exp.fourWheelDrive}{exp.diffLock.center ? ' · C-LOCK' : ''}</span>
        </header>

        <div className="rd-rally-main">
          <div className="rd-rally-speed">
            <DigitalSpeed speedKph={testValue === undefined ? t.speedKph.value : 888} unit={vehicle.speedUnit === 'MPH' ? 'mph' : 'km/h'} heightPx={92} />
          </div>
          <div className="rd-rally-compass">
            <CompassRose headingDeg={testValue === undefined ? t.headingDeg.value : 287} size={128} label="HEADING" />
          </div>
        </div>

        <div className="rd-rally-boost">
          {vehicle.isTurbocharged ? (
            <BoostGauge valueBar={testValue === undefined ? t.boostBar.value : -1 + testValue * 2.5} unit={vehicle.boostUnit} maxBar={Math.max(1.5, vehicle.maxBoostBar)} warningBar={vehicle.boostWarningBar} criticalBar={vehicle.boostCriticalBar} segments={48} />
          ) : (
            <div className="rd-rally-nonboost">
              <span>ENGINE LOAD</span>
              <strong>{Math.round(t.engineLoadPercent.value)}%</strong>
            </div>
          )}
        </div>

        <div className="rd-rally-grid">
          <div><label>ALT</label><strong className="tabular-num">{t.altitudeM.available ? `${Math.round(t.altitudeM.value)}m` : '--'}</strong></div>
          <div><label>TRIP</label><strong className="tabular-num">{t.tripDistanceKm.value.toFixed(2)} km</strong></div>
          <div><label>PITCH</label><strong className="tabular-num">{pitch >= 0 ? '+' : ''}{pitch.toFixed(0)}°</strong></div>
          <div><label>ROLL</label><strong className="tabular-num">{roll >= 0 ? '+' : ''}{roll.toFixed(0)}°</strong></div>
          <div><label>WATER</label><strong className="tabular-num">{t.coolantTempC.value.toFixed(0)}°</strong></div>
          <div><label>VOLT</label><strong className="tabular-num">{t.batteryVoltage.value.toFixed(1)}V</strong></div>
          <div><label>FUEL</label><strong className="tabular-num">{t.fuelPercent.value.toFixed(0)}%</strong></div>
        </div>

        <footer className="rd-rally-footer">
          <WarningLampStrip forceAllLit={testValue !== undefined} />
          <OdoTripClockRow telemetry={t} />
        </footer>
      </div>
      <MediaTicker visible={display.mediaTickerEnabled && isPlaying} title={track.title} artist={track.artist} />
    </>
  )
}
