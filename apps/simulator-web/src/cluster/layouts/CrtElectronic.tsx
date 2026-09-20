import { useDashboardData } from './useDashboardData'
import { DigitalSpeed } from '../widgets/DigitalSpeed'
import { RpmBar } from '../widgets/RpmBar'
import { OdoTripClockRow } from './DashboardChrome'
import { WarningLampStrip } from '../widgets/WarningLampStrip'
export function CrtElectronic(){
  const {telemetry:t,vehicle,connections}=useDashboardData()
  return <div className="rd-crt-layout"><header>RETRODRIVE / ELECTRONIC INSTRUMENTS <span>SYS. 04 / {vehicle.nickname}</span></header><div className="crt-readout"><aside><b>ENGINE CONTROL</b><span>ECU / {connections.obd}</span><span>POSITION / {connections.gps}</span><span>INJECTION / {t.shortFuelTrimPercent.value.toFixed(1)}%</span><span>INTAKE / {t.intakeTempC.value.toFixed(0)}°C</span><span>CHARGING / {t.batteryVoltage.value.toFixed(1)} V</span></aside><DigitalSpeed speedKph={t.speedKph.value} heightPx={110}/><aside><b>OPERATING STATUS</b><strong>{t.coolantTempC.value.toFixed(0)}°C</strong><span>COOLANT TEMPERATURE</span><strong>{t.fuelPercent.value.toFixed(0)}%</strong><span>FUEL REMAINING</span></aside></div><div className="crt-engine-graph"><RpmBar rpm={t.rpm.value} redlineRpm={vehicle.redlineRpm}/><svg viewBox="0 0 940 65"><path d="M0 60 H60 L130 40 H230 L290 20 H480 L510 5 H940" stroke="var(--cl-primary-dim)" fill="none"/><text x="15" y="20" fill="var(--cl-muted-text)" fontSize="10">ELECTRONIC ENGINE MONITOR</text></svg></div><WarningLampStrip/><OdoTripClockRow telemetry={t}/></div>
}
