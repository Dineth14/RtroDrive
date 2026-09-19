import { DigitalSpeed } from '../widgets/DigitalSpeed'
import { BoostGauge } from '../widgets/BoostGauge'
import { WarningLampStrip } from '../widgets/WarningLampStrip'
import { CompassRose } from '../widgets/CompassRose'
import { useDashboardData, headingToCompass } from './useDashboardData'
import { OdoTripClockRow, GpsMiniIndicator, MediaTicker } from './DashboardChrome'
import { resolveAuxSlot } from '@/utils/auxSlots'
import type { AuxSlotValue } from '@/types/vehicle'
import './OffroadLayouts.css'

export function Touring95({ testValue }: { testValue?: number }) {
  const { telemetry: t, connections, display, vehicle, isPlaying, track } = useDashboardData()
  const aux = (['COOLANT', 'BATTERY', 'OIL_TEMP'] as AuxSlotValue[]).map((key) => resolveAuxSlot(key, t, vehicle))
  const rangeKm = t.fuelPercent.value * 6.2

  return (
    <>
      <div className="rd-touring95">
        <header className="rd-touring95-head">
          <span>RETRODRIVE / <b>TOURING COMPUTER 95</b></span>
          <span>{vehicle.nickname}</span>
          <span>{connections.gps === 'FIX' ? `POSITION ${headingToCompass(t.headingDeg.value)}` : 'GPS SEARCHING'}</span>
        </header>

        <div className="rd-touring95-main">
          <div className="rd-touring95-speed">
            <DigitalSpeed speedKph={testValue === undefined ? t.speedKph.value : 888} unit={vehicle.speedUnit === 'MPH' ? 'mph' : 'km/h'} heightPx={96} showSource source={vehicle.speedUnit === 'MPH' ? undefined : undefined} />
            <GpsMiniIndicator telemetry={t} gpsFix={connections.gps === 'FIX'} />
          </div>
          <div className="rd-touring95-compass">
            <CompassRose headingDeg={testValue === undefined ? t.headingDeg.value : 0} size={116} label="HEADING" />
          </div>
          <div className="rd-touring95-range">
            <span>RANGE TO EMPTY</span>
            <strong className="tabular-num">{Math.max(0, Math.round(rangeKm))} km</strong>
            <span>FUEL {t.fuelPercent.value.toFixed(0)}%</span>
          </div>
        </div>

        {vehicle.isTurbocharged && (
          <div className="rd-touring95-boost">
            <BoostGauge valueBar={testValue === undefined ? t.boostBar.value : -1 + testValue * 2.5} unit={vehicle.boostUnit} maxBar={Math.max(1.5, vehicle.maxBoostBar)} warningBar={vehicle.boostWarningBar} criticalBar={vehicle.boostCriticalBar} segments={48} />
          </div>
        )}

        <div className="rd-touring95-aux">
          {aux.map((a, i) => (
            <div key={i}>
              <label>{a.label}</label>
              <strong>{a.available ? a.value.toFixed(a.decimals) : 'N/A'}<small>{a.unit}</small></strong>
            </div>
          ))}
          <div><label>ALT</label><strong>{t.altitudeM.available ? Math.round(t.altitudeM.value) : '--'}<small>m</small></strong></div>
        </div>

        <footer className="rd-touring95-footer">
          <WarningLampStrip forceAllLit={testValue !== undefined} />
          <OdoTripClockRow telemetry={t} />
        </footer>
      </div>
      <MediaTicker visible={display.mediaTickerEnabled && isPlaying} title={track.title} artist={track.artist} />
    </>
  )
}
