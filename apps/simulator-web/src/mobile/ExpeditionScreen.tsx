import { useVehicleStore } from '@/state/vehicleStore'
import { useSettingsStore } from '@/state/settingsStore'
import { useExpeditionStore } from '@/state/expeditionStore'
import { getVisualProfile } from '@/vehicleProfiles/profiles'
import { CarSilhouette } from '@/vehicleProfiles/CarSilhouette'
import { headingToCompass } from '@/cluster/layouts/useDashboardData'
import './mobile.css'
import './ExpeditionScreen.css'

export function ExpeditionScreen() {
  const t = useVehicleStore((s) => s.telemetry)
  const connections = useVehicleStore((s) => s.connections)
  const vehicle = useSettingsStore((s) => s.vehicleProfile)
  const visual = getVisualProfile(vehicle)
  const exp = useExpeditionStore()

  const mark = () => exp.markWaypoint(t.latitude.value, t.longitude.value, t.altitudeM.value)
  const toggleTrail = () => (exp.expeditionActive ? exp.endExpedition() : exp.startExpedition(t.latitude.value, t.longitude.value))

  return (
    <div>
      <div className="rd-exp-hero">
        <CarSilhouette artwork={visual.carArtwork} connected={connections.obd === 'CONNECTED'} animated />
        <div className="rd-exp-hero-row">
          <div><label>TRIP</label><strong>{t.tripDistanceKm.value.toFixed(1)} km</strong></div>
          <div><label>HEADING</label><strong>{Math.round(t.headingDeg.value)}° {headingToCompass(t.headingDeg.value)}</strong></div>
          <div><label>ALTITUDE</label><strong>{t.altitudeM.available ? `${Math.round(t.altitudeM.value)}m` : '--'}</strong></div>
        </div>
      </div>

      <div className="rd-m-section-label">ATTITUDE</div>
      <div className="rd-m-card">
        <div className="rd-m-row"><span className="rd-m-row-label">Pitch</span><span className="rd-m-row-value">{exp.pitchDeg >= 0 ? '+' : ''}{exp.pitchDeg.toFixed(0)}°</span></div>
        <div className="rd-m-row"><span className="rd-m-row-label">Roll</span><span className="rd-m-row-value">{exp.rollDeg >= 0 ? '+' : ''}{exp.rollDeg.toFixed(0)}°</span></div>
      </div>

      <div className="rd-m-section-label">VITALS</div>
      <div className="rd-m-card">
        <div className="rd-m-row"><span className="rd-m-row-label">Fuel</span><span className="rd-m-row-value">{t.fuelPercent.value.toFixed(0)}%</span></div>
        <div className="rd-m-row"><span className="rd-m-row-label">Battery</span><span className="rd-m-row-value">{t.batteryVoltage.value.toFixed(1)}V</span></div>
        <div className="rd-m-row"><span className="rd-m-row-label">Coolant</span><span className="rd-m-row-value">{t.coolantTempC.value.toFixed(0)}&deg;C</span></div>
      </div>

      <div className="rd-m-section-label">QUICK ACTIONS</div>
      <div className="rd-exp-actions">
        <button onClick={mark}>MARK</button>
        <button className={exp.expeditionActive ? 'active' : undefined} onClick={toggleTrail}>{exp.expeditionActive ? 'END TRAIL' : 'TRAIL'}</button>
        <button disabled={!exp.startCoordinate}>RETURN</button>
        <button onClick={() => exp.zeroInclinometer()}>COMPASS</button>
        <button>TRIP</button>
      </div>

      <div className="rd-m-section-label">WAYPOINTS ({exp.waypoints.length})</div>
      <div className="rd-m-card">
        {exp.waypoints.length === 0 && <div className="rd-m-empty">No waypoints marked yet.</div>}
        {exp.waypoints.slice().reverse().map((w) => (
          <div className="rd-m-row" key={w.id}>
            <span className="rd-m-row-label">{w.name}</span>
            <span className="rd-m-row-value">{Math.round(w.altitudeM)}m</span>
          </div>
        ))}
      </div>
    </div>
  )
}
