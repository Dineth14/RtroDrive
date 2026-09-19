import { useVehicleStore } from '@/state/vehicleStore'
import { useSettingsStore } from '@/state/settingsStore'
import { useMediaStore } from '@/state/mediaStore'
import type { IgnitionState, EngineState, GpsState, ConnectionState, NavInstructionKind } from '@/types/telemetry'
import type { ScenarioId } from '@/types/scenario'
import { setOverride, clearAllOverrides } from './telemetryEngine'
import { runScenario, clearScenarioOverrides } from './scenarios'
import { triggerBootSequence } from './bootController'
import './DeveloperPanel.css'

const SCENARIOS: { id: ScenarioId; label: string }[] = [
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
]

const HARDWARE_KEYS = ['can', 'obdProtocol', 'gnss', 'sdCard', 'rtc', 'bluetooth', 'wifi', 'audio'] as const

const NAV_KINDS: { kind: NavInstructionKind; label: string }[] = [
  { kind: 'STRAIGHT', label: 'Straight' },
  { kind: 'TURN_LEFT', label: 'Turn Left' },
  { kind: 'TURN_RIGHT', label: 'Turn Right' },
  { kind: 'ROUNDABOUT', label: 'Roundabout' },
  { kind: 'DESTINATION', label: 'Destination' },
]

export function DeveloperPanel() {
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
      </div>

      <div className="rd-dev-divider" />

      <div>
        <div className="rd-dev-section-title">Vehicle / Turbo</div>
        <div className="rd-dev-btn-row" style={{ marginBottom: 6 }}>
          <button
            className={`rd-dev-btn${vehicle.isTurbocharged ? ' active' : ''}`}
            onClick={() => setVehicleProfile({ ...vehicle, isTurbocharged: !vehicle.isTurbocharged })}
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
                    ? { kind: n.kind, distanceM: 0 }
                    : n.kind === 'ROUNDABOUT'
                      ? { kind: n.kind, distanceM: 400, roundaboutExit: 2 }
                      : { kind: n.kind, distanceM: 350 }
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
