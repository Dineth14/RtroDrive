import { useVehicleStore } from '@/state/vehicleStore'
import { useSettingsStore } from '@/state/settingsStore'
import { useMediaStore } from '@/state/mediaStore'
import { useExpeditionStore } from '@/state/expeditionStore'
import type { IgnitionState, EngineState, GpsState, ConnectionState, NavInstructionKind } from '@/types/telemetry'
import type { ScenarioId } from '@/types/scenario'
import type { FourWheelDriveState } from '@/types/expedition'
import { setOverride, clearAllOverrides } from './telemetryEngine'
import { runScenario, clearScenarioOverrides } from './scenarios'
import { triggerBootSequence } from './bootController'
import './DeveloperPanel.css'
import { VEHICLE_PRESETS, type ClusterLayoutId } from '@/types/vehicle'
import { CLUSTER_LAYOUT_LABELS } from '@/cluster/layouts/registry'
import { getVisualProfile } from '@/vehicleProfiles/profiles'

const SCENARIOS: { id: ScenarioId; label: string }[] = [
  { id: 'PARK_VEHICLE', label: 'Park Vehicle' },
  { id: 'NORMAL_COLD_START', label: 'Normal Cold Start' },
  { id: 'NORMAL_HIGHWAY_CRUISE', label: 'Normal Highway Cruise' },
  { id: 'TRAFFIC_IDLE', label: 'Traffic / Idle' },
  { id: 'HARD_ACCELERATION', label: 'Hard Acceleration' },
  { id: 'LOW_BATTERY', label: 'Low Battery' },
  { id: 'ALTERNATOR_FAILURE', label: 'Alternator Failure' },
  { id: 'ENGINE_OVERHEATING', label: 'Engine Overheating' },
  { id: 'LEAN_MIXTURE', label: 'Lean Mixture' },
  { id: 'VACUUM_LEAK_PATTERN', label: 'Vacuum Leak Pattern' },
  { id: 'SENSOR_FAILURE', label: 'Sensor Failure' },
  { id: 'OBD_DISCONNECT', label: 'OBD Disconnect' },
  { id: 'GPS_LOSS', label: 'GPS Loss' },
  { id: 'STORED_DTC', label: 'Stored DTC' },
  { id: 'CRITICAL_ENGINE_WARNING', label: 'Critical Engine Warning' },
  { id: 'TURBO_CRUISE', label: 'Turbo Cruise' },
  { id: 'TURBO_PULL', label: 'Turbo Pull' },
  { id: 'OVERBOOST', label: 'Overboost' },
  { id: 'GPS_DRIVE', label: 'GPS Drive' },
  { id: 'GPS_SIGNAL_LOSS', label: 'GPS Signal Loss' },
  { id: 'NAVIGATION_TURN', label: 'Navigation Turn' },
  { id: 'MUSIC_PLAYBACK', label: 'Music Playback' },
  { id: 'MUSIC_WARNING', label: 'Music + Warning' },
  { id: 'NIGHT_DRIVE', label: 'Night Drive' },
  { id: 'CLASSIC_CRUISE', label: 'Classic Cruise' },
  { id: 'CITY_NAV', label: 'City Nav' },
  { id: 'HIGHWAY_NAV', label: 'Highway Nav' },
  { id: 'PHONE_NAV_LOSS', label: 'Phone Nav Loss' },
  { id: 'EXPEDITION_START', label: 'Expedition Start' },
  { id: 'TRAIL_DRIVE', label: 'Trail Drive' },
  { id: 'STEEP_CLIMB', label: 'Steep Climb' },
  { id: 'SIDE_SLOPE', label: 'Side Slope' },
  { id: 'WAYPOINT_APPROACH', label: 'Waypoint Approach' },
  { id: 'RETURN_TO_START', label: 'Return To Start' },
  { id: 'LOW_FUEL_OFFROAD', label: 'Low Fuel Offroad' },
  { id: 'WINCH_OPERATION', label: 'Winch Operation' },
  { id: 'RALLY_RAID', label: 'Rally Raid' },
]

const HARDWARE_KEYS = ['can', 'obdProtocol', 'gnss', 'sdCard', 'rtc', 'bluetooth', 'wifi', 'audio'] as const

const NAV_KINDS: { kind: NavInstructionKind; label: string }[] = [
  { kind: 'SLIGHT_LEFT', label: 'Slight Left' },
  { kind: 'U_TURN', label: 'U-turn' },
  { kind: 'STRAIGHT', label: 'Straight' },
  { kind: 'TURN_LEFT', label: 'Turn Left' },
  { kind: 'TURN_RIGHT', label: 'Turn Right' },
  { kind: 'ROUNDABOUT', label: 'Roundabout' },
  { kind: 'DESTINATION', label: 'Destination' },
]

export function DeveloperPanel() {
  const display=useSettingsStore(s=>s.display), updateDisplay=useSettingsStore(s=>s.updateDisplay), setPreset=useSettingsStore(s=>s.setVehiclePresetById)
  const ignition = useVehicleStore((s) => s.ignition)
  const engine = useVehicleStore((s) => s.engine)
  const telemetry = useVehicleStore((s) => s.telemetry)
  const connections = useVehicleStore((s) => s.connections)
  const hardware = useVehicleStore((s) => s.hardware)
  const currentScenario = useVehicleStore((s) => s.currentScenario)
  const activeClusterScreen = useVehicleStore((s) => s.activeClusterScreen)
  const navMode = useVehicleStore((s) => s.navMode)

  const setIgnition = useVehicleStore((s) => s.setIgnition)
  const setEngine = useVehicleStore((s) => s.setEngine)
  const setConnections = useVehicleStore((s) => s.setConnections)
  const setHardware = useVehicleStore((s) => s.setHardware)
  const setActiveClusterScreen = useVehicleStore((s) => s.setActiveClusterScreen)
  const setNavMode = useVehicleStore((s) => s.setNavMode)
  const setNavInstruction = useVehicleStore((s) => s.setNavInstruction)

  const vehicle = useSettingsStore((s) => s.vehicleProfile)
  const setVehicleProfile = useSettingsStore((s) => s.setVehicleProfile)

  const isPlaying = useMediaStore((s) => s.isPlaying)
  const togglePlay = useMediaStore((s) => s.togglePlay)
  const mediaNext = useMediaStore((s) => s.next)
  const mediaPrev = useMediaStore((s) => s.previous)

  const exp = useExpeditionStore()
  const visual = getVisualProfile(vehicle)

  const setIgnitionState = (v: IgnitionState) => {
    setIgnition(v)
    if (v === 'ON') triggerBootSequence()
    if (v === 'OFF') {
      setEngine('OFF')
      clearScenarioOverrides()
    }
  }

  const setEngineState = (v: EngineState) => setEngine(v)

  const slider = (
    label: string,
    key: string,
    value: number,
    min: number,
    max: number,
    step: number,
    unit: string
  ) => (
    <div className="rd-dev-slider-row" key={key}>
      <div className="rd-dev-slider-label">
        <span>{label}</span>
        <span className="rd-dev-slider-value">
          {value.toFixed(step < 1 ? 2 : 0)}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setOverride(key as any, Number(e.target.value))}
      />
    </div>
  )

  return (
    <div className="rd-dev">
      <div className="rd-dev-title">DEVELOPER CONSOLE</div>
      <div className="rd-dev-profile-controls"><label>Vehicle personality<select value={vehicle.id} onChange={e=>setPreset(e.target.value)}>{VEHICLE_PRESETS.map(p=><option key={p.id} value={p.id}>{p.nickname}</option>)}</select></label><label>Era<select value={getVisualProfile(vehicle).era} onChange={e=>setPreset(e.target.value==='CLASSIC_60'?'classic60':e.target.value==='DIGITAL_80'?'ae86':'jzx100')}><option value="CLASSIC_60">1950s / 1960s Analogue</option><option value="DIGITAL_80">1980s Electronic</option><option value="PERFORMANCE_90">1990s Performance</option></select></label><label>Instrument layout<select value={display.clusterLayout} onChange={e=>updateDisplay({clusterLayout:e.target.value as ClusterLayoutId})}>{Object.entries(CLUSTER_LAYOUT_LABELS).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><label>Ambient light · {display.ambientLight}%<input aria-label="Ambient light" type="range" min="0" max="100" value={display.ambientLight} onChange={e=>updateDisplay({ambientLight:Number(e.target.value),autoBrightness:true})}/></label><button className="rd-dev-btn" onClick={()=>updateDisplay({nightMode:!display.nightMode})}>{display.nightMode?'NIGHT':'DAY'} ILLUMINATION</button></div>

      <div>
        <div className="rd-dev-section-title">Ignition</div>
        <div className="rd-dev-btn-row">
          {(['OFF', 'ACC', 'ON', 'START'] as IgnitionState[]).map((v) => (
            <button key={v} className={`rd-dev-btn${ignition === v ? ' active' : ''}`} onClick={() => setIgnitionState(v)}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="rd-dev-section-title">Engine</div>
        <div className="rd-dev-btn-row">
          {(['OFF', 'IDLE', 'RUNNING'] as EngineState[]).map((v) => (
            <button key={v} className={`rd-dev-btn${engine === v ? ' active' : ''}`} onClick={() => setEngineState(v)}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="rd-dev-btn-row">
        <button className="rd-dev-btn" onClick={triggerBootSequence}>
          Replay Startup
        </button>
        <button
          className={`rd-dev-btn${activeClusterScreen === 'TEST' ? ' active' : ''}`}
          onClick={() => setActiveClusterScreen(activeClusterScreen === 'TEST' ? 'DASHBOARD' : 'TEST')}
        >
          Display Test
        </button>
        <button
          className={`rd-dev-btn${activeClusterScreen === 'TERRAIN' ? ' active' : ''}`}
          onClick={() => setActiveClusterScreen(activeClusterScreen === 'TERRAIN' ? 'DASHBOARD' : 'TERRAIN')}
        >
          Terrain Screen
        </button>
      </div>

      <div className="rd-dev-divider" />

      <div>
        <div className="rd-dev-section-title">Vehicle / Turbo</div>
        <div className="rd-dev-btn-row" style={{ marginBottom: 6 }}>
          <button
            className={`rd-dev-btn${vehicle.isTurbocharged ? ' active' : ''}`}
            onClick={() => setVehicleProfile({ ...vehicle, isTurbocharged: !vehicle.isTurbocharged, maxBoostBar:vehicle.maxBoostBar||1.5, boostWarningBar:vehicle.boostWarningBar||1.2, boostCriticalBar:vehicle.boostCriticalBar||1.4 })}
          >
            TURBOCHARGED: {vehicle.isTurbocharged ? 'YES' : 'NO'}
          </button>
        </div>
        {slider('MAP Absolute', 'mapAbsoluteKpa', telemetry.mapAbsoluteKpa.value, 20, 250, 1, ' kPa')}
        {slider('Barometric', 'barometricPressureKpa', telemetry.barometricPressureKpa.value, 85, 105, 0.5, ' kPa')}
        <div style={{ fontSize: 11, color: 'var(--cl-primary-dim)', margin: '2px 0 4px' }}>
          Calculated boost: {telemetry.boostBar.value >= 0 ? '+' : ''}
          {telemetry.boostBar.value.toFixed(2)} bar
        </div>
      </div>

      <div className="rd-dev-divider" />

      <div>
        <div className="rd-dev-section-title">Manual Telemetry Overrides</div>
        {slider('Speed', 'speedKph', telemetry.speedKph.value, 0, 220, 1, ' km/h')}
        {slider('RPM', 'rpm', telemetry.rpm.value, 0, 8000, 50, '')}
        {slider('Coolant', 'coolantTempC', telemetry.coolantTempC.value, 20, 130, 1, '°C')}
        {slider('IAT', 'intakeTempC', telemetry.intakeTempC.value, 0, 90, 1, '°C')}
        {slider('Battery', 'batteryVoltage', telemetry.batteryVoltage.value, 8, 16, 0.1, 'V')}
        {slider('Fuel', 'fuelPercent', telemetry.fuelPercent.value, 0, 100, 1, '%')}
        {slider('STFT', 'shortFuelTrimPercent', telemetry.shortFuelTrimPercent.value, -30, 30, 1, '%')}
        {slider('LTFT', 'longFuelTrimPercent', telemetry.longFuelTrimPercent.value, -30, 30, 1, '%')}
        {slider('Engine Load', 'engineLoadPercent', telemetry.engineLoadPercent.value, 0, 100, 1, '%')}
        {slider('Boost', 'boostBar', telemetry.boostBar.value, -1, 1.8, 0.05, ' bar')}
        <button className="rd-dev-clear-btn" onClick={clearAllOverrides} style={{ width: '100%', marginTop: 4 }}>
          RELEASE MANUAL OVERRIDES
        </button>
      </div>

      <div className="rd-dev-divider" />

      <div>
        <div className="rd-dev-section-title">GPS Simulation</div>
        <div className="rd-dev-btn-row" style={{ marginBottom: 6 }}>
          {(['FIX', 'SEARCHING', 'LOST'] as GpsState[]).map((v) => (
            <button key={v} className={`rd-dev-btn${connections.gps === v ? ' active' : ''}`} onClick={() => setConnections({ gps: v })}>
              GPS {v}
            </button>
          ))}
        </div>
        {slider('Heading', 'headingDeg', telemetry.headingDeg.value, 0, 359, 1, '°')}
        {slider('Latitude', 'latitude', telemetry.latitude.value, -90, 90, .0001, '°')}
        {slider('Longitude', 'longitude', telemetry.longitude.value, -180, 180, .0001, '°')}
        {slider('Satellites', 'satelliteCount', telemetry.satelliteCount.value, 0, 24, 1, '')}
        {slider('Accuracy', 'gpsAccuracyM', telemetry.gpsAccuracyM.value, 1, 100, .5, ' m')}
        <div style={{ fontSize: 11, color: 'var(--cl-muted-text)' }}>
          Satellites: {telemetry.satelliteCount.value} &nbsp; Accuracy: ±{telemetry.gpsAccuracyM.value.toFixed(1)}m
        </div>
      </div>

      <div className="rd-dev-divider" />

      <div>
        <div className="rd-dev-section-title">Navigation Simulation</div>
        <div className="rd-dev-btn-row" style={{ marginBottom: 6 }}>
          {(['STANDALONE', 'PHONE_ASSISTED'] as const).map((m) => (
            <button key={m} className={`rd-dev-btn${navMode === m ? ' active' : ''}`} onClick={() => setNavMode(m)}>
              {m === 'STANDALONE' ? 'STANDALONE' : 'PHONE NAV'}
            </button>
          ))}
        </div>
        <div className="rd-dev-btn-row">
          {NAV_KINDS.map((n) => (
            <button
              key={n.kind}
              className="rd-dev-btn"
              onClick={() =>
                setNavInstruction(
                  n.kind === 'DESTINATION'
                    ? { kind: n.kind, distanceM: 0, destinationDistanceKm:0, destinationEtaMin:0 }
                    : n.kind === 'ROUNDABOUT'
                      ? { kind: n.kind, distanceM: 400, roundaboutExit: 2, destinationDistanceKm:8.2, destinationEtaMin:14 }
                      : { kind: n.kind, distanceM: 350, destinationDistanceKm:8.2, destinationEtaMin:14 }
                )
              }
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rd-dev-divider" />

      <div>
        <div className="rd-dev-section-title">Expedition / Off-Road{visual.supportsOffRoadMode ? '' : ' (non off-road vehicle)'}</div>
        <div className="rd-dev-btn-row" style={{ marginBottom: 6 }}>
          <button className={`rd-dev-btn${exp.expeditionActive ? ' active' : ''}`} onClick={() => exp.expeditionActive ? exp.endExpedition() : exp.startExpedition(telemetry.latitude.value, telemetry.longitude.value)}>
            {exp.expeditionActive ? 'END EXPEDITION' : 'START EXPEDITION'}
          </button>
          <button className="rd-dev-btn" onClick={() => exp.markWaypoint(telemetry.latitude.value, telemetry.longitude.value, telemetry.altitudeM.value)}>
            MARK WAYPOINT
          </button>
          <button className="rd-dev-btn" onClick={() => exp.clearWaypoints()}>
            CLEAR WAYPOINTS ({exp.waypoints.length})
          </button>
        </div>
        <div className="rd-dev-slider-row">
          <div className="rd-dev-slider-label">
            <span>Pitch</span>
            <span className="rd-dev-slider-value">{exp.pitchDeg.toFixed(0)}°</span>
          </div>
          <input type="range" min={-35} max={35} step={1} value={exp.pitchDeg} onChange={(e) => exp.setPitchOverride(Number(e.target.value))} />
        </div>
        <div className="rd-dev-slider-row">
          <div className="rd-dev-slider-label">
            <span>Roll</span>
            <span className="rd-dev-slider-value">{exp.rollDeg.toFixed(0)}°</span>
          </div>
          <input type="range" min={-30} max={30} step={1} value={exp.rollDeg} onChange={(e) => exp.setRollOverride(Number(e.target.value))} />
        </div>
        <div className="rd-dev-btn-row" style={{ margin: '4px 0' }}>
          <button className="rd-dev-btn" onClick={() => { exp.setPitchOverride(null); exp.setRollOverride(null) }}>RELEASE PITCH/ROLL</button>
          <button className="rd-dev-btn" onClick={() => exp.zeroInclinometer()}>INCLINOMETER ZERO</button>
        </div>
        {slider('Altitude', 'altitudeM', telemetry.altitudeM.value, -50, 3000, 10, ' m')}
        <div className="rd-dev-btn-row" style={{ marginBottom: 6 }}>
          {(['2H', '4H', '4L'] as FourWheelDriveState[]).map((v) => (
            <button key={v} className={`rd-dev-btn${exp.fourWheelDrive === v ? ' active' : ''}`} onClick={() => exp.setFourWheelDrive(v)}>{v}</button>
          ))}
        </div>
        <div className="rd-dev-btn-row" style={{ marginBottom: 6 }}>
          <button className={`rd-dev-btn${exp.diffLock.center ? ' active' : ''}`} onClick={() => exp.toggleDiffLock('center')}>CENTER LOCK</button>
          <button className={`rd-dev-btn${exp.diffLock.front ? ' active' : ''}`} onClick={() => exp.toggleDiffLock('front')}>FRONT LOCK</button>
          <button className={`rd-dev-btn${exp.diffLock.rear ? ' active' : ''}`} onClick={() => exp.toggleDiffLock('rear')}>REAR LOCK</button>
          <button className={`rd-dev-btn${exp.winchActive ? ' active' : ''}`} onClick={() => exp.setWinch(!exp.winchActive)}>WINCH</button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--cl-muted-text)' }}>
          Transmission: {exp.transmissionTempC.toFixed(0)}°C &nbsp; Waypoints: {exp.waypoints.length} &nbsp; Trails saved: {exp.savedTrails.length}
        </div>
      </div>

      <div className="rd-dev-divider" />

      <div>
        <div className="rd-dev-section-title">Media Transport</div>
        <div className="rd-dev-btn-row">
          <button className="rd-dev-btn" onClick={mediaPrev}>PREV</button>
          <button className={`rd-dev-btn${isPlaying ? ' active' : ''}`} onClick={togglePlay}>
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </button>
          <button className="rd-dev-btn" onClick={mediaNext}>NEXT</button>
        </div>
      </div>

      <div className="rd-dev-divider" />

      <div>
        <div className="rd-dev-section-title">Connections</div>
        <div className="rd-dev-btn-row" style={{ marginBottom: 6 }}>
          {(['CONNECTED', 'UNAVAILABLE'] as ConnectionState[]).map((v) => (
            <button key={v} className={`rd-dev-btn${connections.phone === v ? ' active' : ''}`} onClick={() => setConnections({ phone: v })}>
              PHONE {v === 'CONNECTED' ? 'ON' : 'OFF'}
            </button>
          ))}
        </div>
        <div className="rd-dev-btn-row">
          {(['CONNECTED', 'FAULT'] as ConnectionState[]).map((v) => (
            <button
              key={v}
              className={`rd-dev-btn${connections.obd === v ? ' active' : ''}`}
              onClick={() => setConnections({ obd: v })}
            >
              OBD {v === 'CONNECTED' ? 'OK' : 'LOST'}
            </button>
          ))}
        </div>
      </div>

      <div className="rd-dev-divider" />

      <div>
        <div className="rd-dev-section-title">Hardware State</div>
        <div className="rd-dev-btn-row">
          {HARDWARE_KEYS.map((key) => (
            <button
              key={key}
              className={`rd-dev-btn${hardware[key] === 'CONNECTED' ? ' active' : ''}`}
              onClick={() => setHardware({ [key]: hardware[key] === 'CONNECTED' ? 'FAULT' : 'CONNECTED' })}
              style={{ minWidth: 90 }}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="rd-dev-divider" />

      <div>
        <div className="rd-dev-section-title">Scenarios</div>
        <div className="rd-dev-scenario-grid">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              className={`rd-dev-scenario-btn${currentScenario === s.id ? ' active' : ''}`}
              onClick={() => runScenario(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
