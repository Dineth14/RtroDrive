import { useVehicleStore } from '@/state/vehicleStore'
import { useExpeditionStore } from '@/state/expeditionStore'
import { useSettingsStore } from '@/state/settingsStore'
import { Inclinometer } from './widgets/Inclinometer'
import { CompassRose } from './widgets/CompassRose'
import { getVisualProfile } from '@/vehicleProfiles/profiles'
import './TerrainScreen.css'

export function TerrainScreen() {
  const t = useVehicleStore((s) => s.telemetry)
  const vehicle = useSettingsStore((s) => s.vehicleProfile)
  const visual = getVisualProfile(vehicle)
  const exp = useExpeditionStore()

  const inclineVariant = visual.era === 'CLASSIC_60' ? 'ANALOGUE' : 'DIGITAL'

  return (
    <div className="rd-screen">
      <div className="rd-terrain">
        <header className="rd-terrain-head">
          <span>TERRAIN COMPUTER</span>
          <div className="rd-terrain-4wd">
            <span className={exp.fourWheelDrive !== '2H' ? 'on' : undefined}>{exp.fourWheelDrive}</span>
            {exp.diffLock.center && <span className="on">C-LOCK</span>}
            {exp.diffLock.front && <span className="on">F-LOCK</span>}
            {exp.diffLock.rear && <span className="on">R-LOCK</span>}
            {exp.winchActive && <span className="warn">WINCH</span>}
          </div>
        </header>

        <div className="rd-terrain-main">
          <Inclinometer pitchDeg={exp.pitchDeg} rollDeg={exp.rollDeg} size={200} variant={inclineVariant} />
          <CompassRose headingDeg={t.headingDeg.available ? t.headingDeg.value : 0} size={160} label="HEADING" />
        </div>

        <div className="rd-terrain-grid">
          <div><label>ALTITUDE</label><strong className="tabular-num">{t.altitudeM.available ? `${Math.round(t.altitudeM.value)} m` : '--'}</strong></div>
          <div><label>V-SPEED</label><strong className="tabular-num">{exp.verticalSpeedMps >= 0 ? '+' : ''}{exp.verticalSpeedMps.toFixed(1)} m/s</strong></div>
          <div><label>WATER</label><strong className="tabular-num">{t.coolantTempC.value.toFixed(0)}°C</strong></div>
          <div><label>VOLT</label><strong className="tabular-num">{t.batteryVoltage.value.toFixed(1)} V</strong></div>
          <div><label>{vehicle.isTurbocharged ? 'BOOST' : 'TRANS'}</label><strong className="tabular-num">{vehicle.isTurbocharged ? `${t.boostBar.value >= 0 ? '+' : ''}${t.boostBar.value.toFixed(2)} bar` : `${exp.transmissionTempC.toFixed(0)}°C`}</strong></div>
          <div><label>FUEL</label><strong className="tabular-num">{t.fuelPercent.value.toFixed(0)}%</strong></div>
        </div>

        <footer className="rd-terrain-footer">
          <span>TRIP {t.tripDistanceKm.value.toFixed(1)} km</span>
          <span>WAYPOINTS {exp.waypoints.length}</span>
          <span>{exp.expeditionActive ? 'EXPEDITION ACTIVE' : 'EXPEDITION STANDBY'}</span>
        </footer>
      </div>
    </div>
  )
}
