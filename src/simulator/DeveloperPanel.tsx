import { useVehicleStore } from '@/state/vehicleStore'
import type { IgnitionState, EngineState, GpsState, ConnectionState } from '@/types/telemetry'
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
]

const HARDWARE_KEYS = ['can', 'obdProtocol', 'gnss', 'sdCard', 'rtc', 'bluetooth', 'wifi', 'audio'] as const

export function DeveloperPanel() {
  const ignition = useVehicleStore((s) => s.ignition)
  const engine = useVehicleStore((s) => s.engine)
  const telemetry = useVehicleStore((s) => s.telemetry)
  const connections = useVehicleStore((s) => s.connections)
  const hardware = useVehicleStore((s) => s.hardware)
  const currentScenario = useVehicleStore((s) => s.currentScenario)
  const activeClusterScreen = useVehicleStore((s) => s.activeClusterScreen)

  const setIgnition = useVehicleStore((s) => s.setIgnition)
  const setEngine = useVehicleStore((s) => s.setEngine)
  const setConnections = useVehicleStore((s) => s.setConnections)
  const setHardware = useVehicleStore((s) => s.setHardware)
  const setActiveClusterScreen = useVehicleStore((s) => s.setActiveClusterScreen)

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
          {value.toFixed(step < 1 ? 1 : 0)}
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
        <button className="rd-dev-clear-btn" onClick={clearAllOverrides} style={{ width: '100%', marginTop: 4 }}>
          RELEASE MANUAL OVERRIDES
        </button>
      </div>

      <div className="rd-dev-divider" />

      <div>
        <div className="rd-dev-section-title">Connections</div>
        <div className="rd-dev-btn-row" style={{ marginBottom: 6 }}>
          {(['FIX', 'SEARCHING', 'LOST'] as GpsState[]).map((v) => (
            <button key={v} className={`rd-dev-btn${connections.gps === v ? ' active' : ''}`} onClick={() => setConnections({ gps: v })}>
              GPS {v}
            </button>
          ))}
        </div>
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
