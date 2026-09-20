import { DigitalSpeed } from '../widgets/DigitalSpeed'
import { BoostGauge } from '../widgets/BoostGauge'
import { WarningLampStrip } from '../widgets/WarningLampStrip'
import { resolveAuxSlot } from '@/utils/auxSlots'
import { useDashboardData } from './useDashboardData'
import { OdoTripClockRow, GpsMiniIndicator, MediaTicker } from './DashboardChrome'
import type { AuxSlotValue } from '@/types/vehicle'
import './VehicleLayouts.css'
export function PerformanceTach({ rpm, redline }: { rpm: number; redline: number }) {
  const max = Math.ceil((redline + 500) / 1000) * 1000
  return <svg className="rd-gt-tach" viewBox="0 0 950 142" role="img" aria-label={`Engine speed ${Math.round(rpm)} RPM`}>
    <path d="M15 106 L330 28 H935" stroke="var(--cl-grid-line)" fill="none"/>
    {Array.from({length:60},(_,i)=>{
      const x = 18 + i * 15.3, y = i < 21 ? 109 - i * 3.7 : 31
      const val = (i + 1) / 60 * max, color = val >= redline ? 'var(--cl-critical-red)' : val >= redline * .85 ? 'var(--cl-amber)' : 'var(--cl-primary-bright)'
      return <path key={i} d={`M${x} ${y} v-22 h11 v22 Z`} fill={rpm >= val ? color : 'var(--cl-grid-line)'}/>
    })}
    {Array.from({length:max / 1000 + 1},(_,i)=>{const x=18+i/(max/1000)*918;return <text key={i} x={x} y={x<340?135-(x-18)*.24:58} fill={i*1000>=redline?'var(--cl-critical-red)':'var(--cl-primary)'} fontSize="17" textAnchor="middle">{i}</text>})}
    <text x="540" y="100" fill="var(--cl-muted-text)" fontSize="11" letterSpacing="3">ENGINE SPEED / ×1000 r/min</text>
    <text x="934" y="108" fill="var(--cl-primary-bright)" fontSize="30" textAnchor="end">{Math.round(rpm).toString().padStart(4,'0')}</text>
  </svg>
}
export function JdmGt93({ testValue }: { testValue?: number }) {
  const { telemetry:t, speedSourceActive, connections, display, vehicle, isPlaying, track } = useDashboardData()
  const aux = (['COOLANT','OIL_TEMP','OIL_PRESSURE','IAT','BATTERY','FUEL'] as AuxSlotValue[]).map(key=>resolveAuxSlot(key,t,vehicle))
  return <><div className="rd-gt">
    <header className="rd-gt-heading"><span>RETRODRIVE / <b>GT 93</b></span><span>{vehicle.nickname}</span><span>{vehicle.isTurbocharged ? 'TURBO / INTERCOOLED' : 'GRAND TOURING'}</span></header>
    <PerformanceTach rpm={testValue === undefined ? t.rpm.value : testValue*8000} redline={vehicle.redlineRpm}/>
    <div className="rd-gt-main"><div className="rd-gt-meta"><small>TRANSMISSION</small><strong>{t.gearPosition.value}<small> GEAR</small></strong><GpsMiniIndicator telemetry={t} gpsFix={connections.gps==='FIX'}/></div>
      <DigitalSpeed speedKph={testValue === undefined ? t.speedKph.value * (vehicle.speedUnit==='MPH'?.621371:1) : 888} unit={vehicle.speedUnit==='MPH'?'mph':'km/h'} heightPx={108} source={speedSourceActive} showSource/>
      <div className="rd-gt-meta right"><small>ENGINE LOAD</small><strong>{Math.round(t.engineLoadPercent.value)}<small> %</small></strong><span>{Math.round(t.throttlePercent.value)}% THROTTLE</span></div></div>
    <div className="rd-gt-boost">{vehicle.isTurbocharged && t.boostBar.available ? <BoostGauge valueBar={testValue === undefined?t.boostBar.value:-1+testValue*2.5} unit={vehicle.boostUnit} maxBar={Math.max(1.5,vehicle.maxBoostBar)} warningBar={vehicle.boostWarningBar} criticalBar={vehicle.boostCriticalBar} segments={60}/> : <div className="rd-gt-heading"><span>INDUCTION / NATURALLY ASPIRATED</span><b>{t.mapAbsoluteKpa.value.toFixed(0)} kPa MAP</b></div>}</div>
    <div className="rd-gt-aux">{aux.map((a,i)=><div key={i}><label>{a.label}</label><strong>{a.available?a.value.toFixed(a.decimals):'N/A'}<small>{a.unit}</small></strong></div>)}</div>
    <footer className="rd-gt-footer"><WarningLampStrip forceAllLit={testValue!==undefined}/><OdoTripClockRow telemetry={t}/></footer>
  </div><MediaTicker visible={display.mediaTickerEnabled&&isPlaying} title={track.title} artist={track.artist}/></>
}
