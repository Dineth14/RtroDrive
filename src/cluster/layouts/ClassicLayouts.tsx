import { ClassicSpeedometer, ClassicTachometer, ClassicFuelGauge, ClassicTemperatureGauge, ClassicRoundGauge, ClassicVoltageGauge } from '../gauges/classic/ClassicGauges'
import { useDashboardData, headingToCompass } from './useDashboardData'
import { OdoTripClockRow, MediaTicker } from './DashboardChrome'
import { WarningLampStrip } from '../widgets/WarningLampStrip'
import { resolveAuxSlot } from '@/utils/auxSlots'
import './VehicleLayouts.css'

export function ClassicDashboard({ variant = 'roadster', testValue }: { variant?: 'roadster' | 'touring' | 'mini' | 'tourer'; testValue?: number }) {
  const { telemetry: t, vehicle, display, isPlaying, track, connections } = useDashboardData()
  const oil = resolveAuxSlot('OIL_PRESSURE', t, vehicle)
  const v = (n: number, max: number) => testValue !== undefined ? testValue * max : n
  const speed = <ClassicSpeedometer value={v(t.speedKph.value * (vehicle.speedUnit === 'MPH' ? .621371 : 1), 200)} unit={vehicle.speedUnit === 'MPH' ? 'mph' : 'km/h'} size={variant === 'mini' ? 342 : variant === 'roadster' ? 290 : 310} odometer={t.odometerKm.value + (testValue ?? 0)}/>
  const tach = <ClassicTachometer value={v(t.rpm.value / 1000, 8)} size={variant === 'mini' ? 220 : variant === 'roadster' ? 290 : 310} warningAt={vehicle.redlineRpm / 1000}/>
  const fuel = <ClassicFuelGauge value={v(t.fuelPercent.value,100)} size={138}/>
  const temp = <ClassicTemperatureGauge value={v(t.coolantTempC.value,120)} size={138}/>
  const oilGauge = <ClassicRoundGauge value={v(oil.value, oil.key === 'OIL_PRESSURE' ? 6 : 140)} label={oil.label} unit={oil.unit} max={oil.key === 'OIL_PRESSURE' ? 6 : 140} major={4} size={138}/>
  return <div className={`rd-classic-layout rd-classic-${variant}`}>
    <header><span>RETRODRIVE</span><strong>{variant === 'mini' ? 'Mini Heritage' : variant === 'tourer' ? 'Vintage Tourer' : variant === 'touring' ? 'Grand Touring · 62' : 'Classic Roadster · 60'}</strong><span>{vehicle.nickname}</span></header>
    {variant === 'roadster' && <><div className="classic-main-pair">{speed}<div className="classic-signature">R<span>INSTRUMENTS</span><small>PRECISION · ENDURANCE</small></div>{tach}</div><div className="classic-aux-row">{fuel}{temp}{oilGauge}<ClassicVoltageGauge value={v(t.batteryVoltage.value,16)} size={138}/></div></>}
    {variant === 'mini' && <div className="classic-mini-composition"><div>{tach}{fuel}</div><div>{speed}<span className="classic-mini-script">A little extraordinary.</span></div><div>{temp}{oilGauge}</div></div>}
    {variant === 'touring' && <div className="classic-tour-composition">{speed}<div>{temp}{fuel}{oilGauge}</div>{tach}</div>}
    {variant === 'tourer' && <div className="classic-expedition"><div>{speed}<span>EXPEDITION / ALL TERRAIN</span></div><div className="classic-expedition-aux">{fuel}{temp}<ClassicVoltageGauge value={v(t.batteryVoltage.value,16)} size={138}/><ClassicRoundGauge value={t.headingDeg.value} max={360} label="BEARING" unit="DEGREES" size={138} major={4}/></div><div className="classic-trip"><small>TRIP DISTANCE</small><b>{t.tripDistanceKm.value.toFixed(1)}</b><span>km</span><hr/><small>POSITION</small><b>{connections.gps === 'FIX' ? headingToCompass(t.headingDeg.value) : 'NO FIX'}</b></div></div>}
    <footer><WarningLampStrip forceAllLit={testValue !== undefined}/><div className="classic-information"><OdoTripClockRow telemetry={t}/><span>POSITION {connections.gps === 'FIX' ? headingToCompass(t.headingDeg.value) : 'SEARCHING'} · {t.batteryVoltage.value.toFixed(1)} V</span></div></footer>
    <MediaTicker visible={display.mediaTickerEnabled && isPlaying} title={track.title} artist={track.artist}/>
  </div>
}
export const ClassicRoadster60 = () => <ClassicDashboard/>
export const GrandTouring62 = () => <ClassicDashboard variant="touring"/>
export const MiniHeritage = () => <ClassicDashboard variant="mini"/>
export const VintageTourer = () => <ClassicDashboard variant="tourer"/>
