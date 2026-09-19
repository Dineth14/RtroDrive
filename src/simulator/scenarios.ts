import type { ScenarioId } from '@/types/scenario'
import { useVehicleStore } from '@/state/vehicleStore'
import { useSettingsStore } from '@/state/settingsStore'
import { useMediaStore } from '@/state/mediaStore'
import { clearAllOverrides, setOverride, clearOverride, setForcedUnavailable } from './telemetryEngine'
import { createDtc } from './diagnosticEngine'

interface Keyframe {
  atMs: number
  values?: Partial<Record<string, number>>
  onReach?: () => void
}

interface ScenarioDef {
  id: ScenarioId
  label: string
  durationMs: number
  keyframes: Keyframe[]
  releaseOverridesAtEnd?: boolean
  setup?: () => void
}

function interp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function applyScenario(def: ScenarioDef, elapsedMs: number) {
  const frames = def.keyframes
  let lower = frames[0]
  let upper = frames[frames.length - 1]
  for (let i = 0; i < frames.length - 1; i++) {
    if (elapsedMs >= frames[i].atMs && elapsedMs <= frames[i + 1].atMs) {
      lower = frames[i]
      upper = frames[i + 1]
      break
    }
  }
  const span = Math.max(1, upper.atMs - lower.atMs)
  const t = Math.min(1, Math.max(0, (elapsedMs - lower.atMs) / span))

  const values: Record<string, number> = {}
  if (lower.values) Object.assign(values, lower.values)
  if (upper.values && lower !== upper) {
    for (const key of Object.keys(upper.values)) {
      const from = lower.values?.[key] ?? upper.values[key]!
      const to = upper.values[key]!
      values[key] = interp(from, to, t)
    }
  }
  for (const [k, v] of Object.entries(values)) {
    setOverride(k as any, v)
  }
}

export const SCENARIOS: Record<ScenarioId, ScenarioDef> = {
  NORMAL_COLD_START: {
    id: 'NORMAL_COLD_START',
    label: 'Normal Cold Start',
    durationMs: 8000,
    releaseOverridesAtEnd: true,
    setup: () => {
      useVehicleStore.getState().setTelemetry({})
    },
    keyframes: [
      { atMs: 0, values: { coolantTempC: 22, speedKph: 0, rpm: 1400 } },
      { atMs: 4000, values: { coolantTempC: 30, speedKph: 0, rpm: 1100 } },
      { atMs: 8000, values: { coolantTempC: 38, speedKph: 0, rpm: 850 } },
    ],
  },
  NORMAL_HIGHWAY_CRUISE: {
    id: 'NORMAL_HIGHWAY_CRUISE',
    label: 'Normal Highway Cruise',
    durationMs: 6000,
    releaseOverridesAtEnd: true,
    keyframes: [
      { atMs: 0, values: { speedKph: 60, rpm: 2600 } },
      { atMs: 6000, values: { speedKph: 108, rpm: 3200 } },
    ],
  },
  TRAFFIC_IDLE: {
    id: 'TRAFFIC_IDLE',
    label: 'Traffic / Idle',
    durationMs: 5000,
    releaseOverridesAtEnd: true,
    keyframes: [
      { atMs: 0, values: { speedKph: 25 } },
      { atMs: 2500, values: { speedKph: 0 } },
      { atMs: 5000, values: { speedKph: 8 } },
    ],
  },
  HARD_ACCELERATION: {
    id: 'HARD_ACCELERATION',
    label: 'Hard Acceleration',
    durationMs: 5000,
    releaseOverridesAtEnd: true,
    keyframes: [
      { atMs: 0, values: { speedKph: 20, rpm: 2000, engineLoadPercent: 40 } },
      { atMs: 5000, values: { speedKph: 150, rpm: 6800, engineLoadPercent: 96 } },
    ],
  },
  LOW_BATTERY: {
    id: 'LOW_BATTERY',
    label: 'Low Battery',
    durationMs: 6000,
    keyframes: [
      { atMs: 0, values: { batteryVoltage: 12.4 } },
      { atMs: 6000, values: { batteryVoltage: 11.2 } },
    ],
  },
  ALTERNATOR_FAILURE: {
    id: 'ALTERNATOR_FAILURE',
    label: 'Alternator Failure',
    durationMs: 14000,
    keyframes: [
      { atMs: 0, values: { speedKph: 70, rpm: 2400, batteryVoltage: 14.2 } },
      { atMs: 3000, values: { batteryVoltage: 13.9 } },
      { atMs: 6000, values: { batteryVoltage: 13.4 } },
      { atMs: 9000, values: { batteryVoltage: 12.8 } },
      { atMs: 11000, values: { batteryVoltage: 12.2 } },
      { atMs: 14000, values: { batteryVoltage: 11.7 } },
    ],
  },
  ENGINE_OVERHEATING: {
    id: 'ENGINE_OVERHEATING',
    label: 'Engine Overheating',
    durationMs: 20000,
    keyframes: [
      { atMs: 0, values: { speedKph: 45, rpm: 2200, coolantTempC: 88 } },
      { atMs: 3000, values: { coolantTempC: 92 } },
      { atMs: 6000, values: { coolantTempC: 96 } },
      { atMs: 9000, values: { coolantTempC: 101 } },
      { atMs: 12000, values: { coolantTempC: 104 } },
      { atMs: 15000, values: { coolantTempC: 108 } },
      { atMs: 17000, values: { coolantTempC: 113 } },
      { atMs: 20000, values: { coolantTempC: 113 } },
    ],
  },
  LEAN_MIXTURE: {
    id: 'LEAN_MIXTURE',
    label: 'Lean Mixture',
    durationMs: 10000,
    keyframes: [
      { atMs: 0, values: { rpm: 800, shortFuelTrimPercent: 5, longFuelTrimPercent: 3 } },
      { atMs: 10000, values: { shortFuelTrimPercent: 22, longFuelTrimPercent: 16 } },
    ],
  },
  VACUUM_LEAK_PATTERN: {
    id: 'VACUUM_LEAK_PATTERN',
    label: 'Vacuum Leak Pattern',
    durationMs: 12000,
    keyframes: [
      { atMs: 0, values: { rpm: 800, shortFuelTrimPercent: 6, longFuelTrimPercent: 4 } },
      { atMs: 6000, values: { shortFuelTrimPercent: 24, longFuelTrimPercent: 18 } },
      { atMs: 8000, values: { rpm: 2500, shortFuelTrimPercent: 9, longFuelTrimPercent: 14 } },
      { atMs: 12000, values: { rpm: 800, shortFuelTrimPercent: 24, longFuelTrimPercent: 18 } },
    ],
  },
  SENSOR_FAILURE: {
    id: 'SENSOR_FAILURE',
    label: 'Sensor Failure',
    durationMs: 8000,
    keyframes: [
      { atMs: 0, onReach: () => setForcedUnavailable('coolantTempC', true) },
      { atMs: 8000, onReach: () => setForcedUnavailable('coolantTempC', false) },
    ],
  },
  OBD_DISCONNECT: {
    id: 'OBD_DISCONNECT',
    label: 'OBD Disconnect',
    durationMs: 1000,
    keyframes: [{ atMs: 0 }, { atMs: 1000 }],
    setup: () => {
      useVehicleStore.getState().setConnections({ obd: 'FAULT' })
      useVehicleStore.getState().setHardware({ can: 'FAULT', obdProtocol: 'FAULT' })
    },
  },
  GPS_LOSS: {
    id: 'GPS_LOSS',
    label: 'GPS Loss',
    durationMs: 1000,
    keyframes: [{ atMs: 0 }, { atMs: 1000 }],
    setup: () => {
      useVehicleStore.getState().setConnections({ gps: 'LOST' })
      useVehicleStore.getState().setHardware({ gnss: 'FAULT' })
    },
  },
  STORED_DTC: {
    id: 'STORED_DTC',
    label: 'Stored DTC',
    durationMs: 500,
    keyframes: [{ atMs: 0 }, { atMs: 500 }],
    setup: () => {
      const t = useVehicleStore.getState().telemetry
      const dtc = createDtc(
        'P0420',
        t,
        [
          { label: 'Upstream O2 switching', value: 'Normal' },
          { label: 'Downstream O2 switching', value: 'Reduced amplitude' },
        ],
        'ADVISORY',
        'LOW'
      )
      dtc.status = 'STORED'
      dtc.timestamp = Date.now() - 3 * 86400000
      useVehicleStore.getState().addOrUpdateDtc(dtc)
    },
  },
  CRITICAL_ENGINE_WARNING: {
    id: 'CRITICAL_ENGINE_WARNING',
    label: 'Critical Engine Warning',
    durationMs: 4000,
    keyframes: [
      { atMs: 0, values: { rpm: 3500, oilPressureBar: 3.2 } },
      { atMs: 4000, values: { rpm: 3500, oilPressureBar: 0.3 } },
    ],
    setup: () => {
      const t = useVehicleStore.getState().telemetry
      const dtc = createDtc(
        'P0301',
        t,
        [
          { label: 'Misfire cylinder', value: '1' },
          { label: 'Oil pressure', value: 'Dropping' },
        ],
        'CRITICAL',
        'HIGH'
      )
      useVehicleStore.getState().addOrUpdateDtc(dtc)
    },
  },
  TURBO_CRUISE: {
    id: 'TURBO_CRUISE',
    label: 'Turbo Cruise',
    durationMs: 6000,
    releaseOverridesAtEnd: true,
    keyframes: [
      { atMs: 0, values: { speedKph: 40, rpm: 1800 } },
      { atMs: 6000, values: { speedKph: 95, rpm: 3400 } },
    ],
  },
  TURBO_PULL: {
    id: 'TURBO_PULL',
    label: 'Turbo Pull',
    durationMs: 5000,
    releaseOverridesAtEnd: true,
    keyframes: [
      { atMs: 0, values: { speedKph: 30, rpm: 1600 } },
      { atMs: 5000, values: { speedKph: 170, rpm: 7200 } },
    ],
  },
  OVERBOOST: {
    id: 'OVERBOOST',
    label: 'Overboost',
    durationMs: 12000,
    keyframes: [
      { atMs: 0, values: { speedKph: 90, rpm: 4500, boostBar: 0.8 } },
      { atMs: 3000, values: { boostBar: 1.0 } },
      { atMs: 6000, values: { boostBar: 1.2 } },
      { atMs: 9000, values: { boostBar: 1.4 } },
      { atMs: 12000, values: { boostBar: 1.6 } },
    ],
  },
  GPS_DRIVE: {
    id: 'GPS_DRIVE',
    label: 'GPS Drive',
    durationMs: 8000,
    releaseOverridesAtEnd: true,
    setup: () => {
      useVehicleStore.getState().setConnections({ gps: 'FIX' })
      useVehicleStore.getState().setHardware({ gnss: 'CONNECTED' })
    },
    keyframes: [
      { atMs: 0, values: { speedKph: 20, rpm: 1500 } },
      { atMs: 4000, values: { speedKph: 75, rpm: 2600 } },
      { atMs: 8000, values: { speedKph: 60, rpm: 2200 } },
    ],
  },
  GPS_SIGNAL_LOSS: {
    id: 'GPS_SIGNAL_LOSS',
    label: 'GPS Signal Loss',
    durationMs: 1000,
    keyframes: [{ atMs: 0 }, { atMs: 1000 }],
    setup: () => {
      useVehicleStore.getState().setConnections({ gps: 'LOST' })
      useVehicleStore.getState().setHardware({ gnss: 'FAULT' })
    },
  },
  NAVIGATION_TURN: {
    id: 'NAVIGATION_TURN',
    label: 'Navigation Turn',
    durationMs: 16000,
    releaseOverridesAtEnd: true,
    setup: () => {
      const store = useVehicleStore.getState()
      store.setConnections({ gps: 'FIX' })
      store.setNavMode('PHONE_ASSISTED')
      store.setNavInstruction({ kind: 'STRAIGHT', distanceM: 800 })
    },
    keyframes: [
      { atMs: 0, values: { speedKph: 55, rpm: 2200 }, onReach: () => useVehicleStore.getState().setNavInstruction({ kind: 'STRAIGHT', distanceM: 800 }) },
      { atMs: 4000, values: { speedKph: 40 }, onReach: () => useVehicleStore.getState().setNavInstruction({ kind: 'TURN_LEFT', distanceM: 350 }) },
      { atMs: 7000, values: { speedKph: 25 }, onReach: () => useVehicleStore.getState().setNavInstruction({ kind: 'TURN_LEFT', distanceM: 40 }) },
      { atMs: 8500, values: { speedKph: 45 }, onReach: () => useVehicleStore.getState().setNavInstruction({ kind: 'ROUNDABOUT', distanceM: 600, roundaboutExit: 2 }) },
      { atMs: 12000, values: { speedKph: 50 }, onReach: () => useVehicleStore.getState().setNavInstruction({ kind: 'STRAIGHT', distanceM: 1200, destinationDistanceKm: 12.4, destinationEtaMin: 18 }) },
      {
        atMs: 16000,
        values: { speedKph: 10 },
        onReach: () => useVehicleStore.getState().setNavInstruction({ kind: 'DESTINATION', distanceM: 0 }),
      },
    ],
  },
  MUSIC_PLAYBACK: {
    id: 'MUSIC_PLAYBACK',
    label: 'Music Playback',
    durationMs: 500,
    keyframes: [{ atMs: 0 }, { atMs: 500 }],
    setup: () => {
      useMediaStore.getState().play()
    },
  },
  MUSIC_WARNING: {
    id: 'MUSIC_WARNING',
    label: 'Music + Warning',
    durationMs: 20000,
    setup: () => {
      useMediaStore.getState().play()
    },
    keyframes: [
      { atMs: 0, values: { speedKph: 70, rpm: 2600, coolantTempC: 88 } },
      { atMs: 8000, values: { coolantTempC: 96 } },
      { atMs: 12000, values: { coolantTempC: 105 } },
      { atMs: 15000, values: { coolantTempC: 115 } },
      { atMs: 20000, values: { coolantTempC: 90 } },
    ],
  },
  NIGHT_DRIVE: {
    id: 'NIGHT_DRIVE',
    label: 'Night Drive',
    durationMs: 6000,
    releaseOverridesAtEnd: true,
    setup: () => {
      useSettingsStore.getState().updateDisplay({ nightMode: true, autoBrightness: true, ambientLight: 12 })
    },
    keyframes: [
      { atMs: 0, values: { speedKph: 50, rpm: 2000 } },
      { atMs: 6000, values: { speedKph: 90, rpm: 2800 } },
    ],
  },
}

interface RunningScenario {
  def: ScenarioDef
  startedAt: number
  firedKeyframes: Set<number>
}

let running: RunningScenario | null = null
let rafHandle: number | null = null

export function runScenario(id: ScenarioId) {
  const def = SCENARIOS[id]
  if (!def) return
  clearAllOverrides()
  useVehicleStore.getState().setScenario(id)
  useVehicleStore.getState().setIgnition('ON')
  useVehicleStore.getState().setEngine('RUNNING')
  def.setup?.()
  running = { def, startedAt: performance.now(), firedKeyframes: new Set() }
  loop()
}

export function stopScenario() {
  running = null
  useVehicleStore.getState().setScenario(null)
  if (rafHandle !== null) {
    cancelAnimationFrame(rafHandle)
    rafHandle = null
  }
}

function loop() {
  if (rafHandle !== null) cancelAnimationFrame(rafHandle)
  const step = () => {
    if (!running) return
    const elapsed = performance.now() - running.startedAt
    applyScenario(running.def, Math.min(elapsed, running.def.durationMs))

    for (const kf of running.def.keyframes) {
      if (elapsed >= kf.atMs && !running.firedKeyframes.has(kf.atMs)) {
        running.firedKeyframes.add(kf.atMs)
        kf.onReach?.()
      }
    }

    if (elapsed >= running.def.durationMs) {
      if (running.def.releaseOverridesAtEnd) {
        clearAllOverrides()
      }
      useVehicleStore.getState().setScenario(null)
      running = null
      return
    }
    rafHandle = requestAnimationFrame(step)
  }
  rafHandle = requestAnimationFrame(step)
}

export function clearScenarioOverrides() {
  clearAllOverrides()
  useVehicleStore.getState().setScenario(null)
  stopScenario()
}

export { clearOverride }
