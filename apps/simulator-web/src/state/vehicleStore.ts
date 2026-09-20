import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ActiveWarning,
  ConnectionStates,
  EngineState,
  GpsPoint,
  HardwareState,
  IgnitionState,
  NavInstruction,
  ParkedLocation,
  TelemetrySnapshot,
  TripSummary,
} from '@/types/telemetry'
import { makeChannel } from '@/types/telemetry'
import type { DtcRecord, HealthCategory } from '@/types/diagnostics'
import type { ScenarioId } from '@/types/scenario'

export const INITIAL_TELEMETRY: TelemetrySnapshot = {
  speedKph: makeChannel(0, 'OBD'),
  rpm: makeChannel(0, 'OBD'),
  coolantTempC: makeChannel(22, 'OBD'),
  intakeTempC: makeChannel(24, 'OBD'),
  engineLoadPercent: makeChannel(0, 'OBD'),
  throttlePercent: makeChannel(0, 'OBD'),
  batteryVoltage: makeChannel(12.6, 'OBD'),
  fuelPercent: makeChannel(68, 'OBD'),
  mapKpa: makeChannel(30, 'OBD'),
  mafGps: makeChannel(2, 'OBD'),
  shortFuelTrimPercent: makeChannel(1.2, 'OBD'),
  longFuelTrimPercent: makeChannel(0.8, 'OBD'),
  oilPressureBar: makeChannel(0, 'OBD'),
  oilTempC: makeChannel(22, 'OBD'),
  fuelPressureBar: makeChannel(0, 'OBD'),

  latitude: makeChannel(6.9271, 'GPS', false),
  longitude: makeChannel(79.8612, 'GPS', false),
  gpsSpeedKph: makeChannel(0, 'GPS', false),
  headingDeg: makeChannel(0, 'GPS', false),
  satelliteCount: makeChannel(0, 'GPS', false),
  gpsAccuracyM: makeChannel(0, 'GPS', false),

  odometerKm: makeChannel(48213, 'DERIVED'),
  tripDistanceKm: makeChannel(0, 'DERIVED'),
  tripTimeSeconds: makeChannel(0, 'DERIVED'),
  averageSpeedKph: makeChannel(0, 'DERIVED'),
  maxSpeedKph: makeChannel(0, 'DERIVED'),
  maxRpm: makeChannel(0, 'DERIVED'),
  maxCoolantC: makeChannel(0, 'DERIVED'),

  mapAbsoluteKpa: makeChannel(101, 'OBD'),
  barometricPressureKpa: makeChannel(101, 'OBD'),
  boostKpa: makeChannel(0, 'DERIVED'),
  boostBar: makeChannel(0, 'DERIVED'),
  boostPsi: makeChannel(0, 'DERIVED'),
  maxBoostBar: makeChannel(0, 'DERIVED'),

  altitudeM: makeChannel(12, 'GPS', false),
  gearPosition: makeChannel('P', 'DERIVED'),
}

const initialHardware: HardwareState = {
  can: 'UNAVAILABLE',
  obdProtocol: 'UNAVAILABLE',
  gnss: 'UNAVAILABLE',
  sdCard: 'CONNECTED',
  rtc: 'CONNECTED',
  bluetooth: 'CONNECTED',
  wifi: 'UNAVAILABLE',
  audio: 'CONNECTED',
}

const initialConnections: ConnectionStates = {
  obd: 'UNAVAILABLE',
  gps: 'SEARCHING',
  phone: 'CONNECTING',
  audio: 'CONNECTED',
}

const initialHealth: HealthCategory[] = [
  { key: 'ENGINE', label: 'ENGINE', status: 'NORMAL', evidenceLines: ['No abnormal patterns detected.'], statusNote: 'MONITORING' },
  { key: 'COOLING', label: 'COOLING', status: 'NORMAL', evidenceLines: ['Coolant temperature within normal band.'], statusNote: 'MONITORING' },
  { key: 'ELECTRICAL', label: 'ELECTRICAL', status: 'NORMAL', evidenceLines: ['Charging voltage stable.'], statusNote: 'MONITORING' },
  { key: 'FUEL_SYSTEM', label: 'FUEL SYSTEM', status: 'NORMAL', evidenceLines: ['Fuel trims within expected range.'], statusNote: 'MONITORING' },
  { key: 'SENSORS', label: 'SENSORS', status: 'NORMAL', evidenceLines: ['All monitored sensors reporting.'], statusNote: 'MONITORING' },
  { key: 'CONNECTIVITY', label: 'CONNECTIVITY', status: 'UNKNOWN', evidenceLines: ['Awaiting connection.'], statusNote: 'INITIALIZING' },
]

export type BootPhase =
  | 'IDLE'
  | 'BLACK'
  | 'SEGMENT_TEST'
  | 'LAMP_TEST'
  | 'RPM_SWEEP'
  | 'STATUS_INIT'
  | 'SYSTEM_OK'
  | 'DONE'

interface VehicleState {
  ignition: IgnitionState
  engine: EngineState
  telemetry: TelemetrySnapshot
  hardware: HardwareState
  connections: ConnectionStates
  warnings: ActiveWarning[]
  dtcs: DtcRecord[]
  health: HealthCategory[]
  trips: TripSummary[]
  currentScenario: ScenarioId | null
  bootPhase: BootPhase
  speedSourceActive: 'OBD' | 'GPS'
  activeClusterScreen: ClusterScreenId
  drivingLockout: boolean
  gpsBreadcrumb: GpsPoint[]
  parkedLocation: ParkedLocation | null
  navMode: 'STANDALONE' | 'PHONE_ASSISTED'
  navInstruction: NavInstruction | null

  setIgnition: (state: IgnitionState) => void
  setEngine: (state: EngineState) => void
  setTelemetry: (patch: Partial<TelemetrySnapshot>) => void
  setHardware: (patch: Partial<HardwareState>) => void
  setConnections: (patch: Partial<ConnectionStates>) => void
  setSpeedSourceActive: (src: 'OBD' | 'GPS') => void
  pushWarning: (w: ActiveWarning) => void
  acknowledgeWarning: (id: string) => void
  clearWarning: (id: string) => void
  removeWarningsBySource: (source: string) => void
  addOrUpdateDtc: (dtc: DtcRecord) => void
  clearDtc: (code: string) => void
  setHealth: (categories: HealthCategory[]) => void
  updateHealthCategory: (key: HealthCategory['key'], patch: Partial<HealthCategory>) => void
  setScenario: (id: ScenarioId | null) => void
  setBootPhase: (phase: BootPhase) => void
  finishTrip: () => void
  resetTrip: () => void
  setActiveClusterScreen: (screen: ClusterScreenId) => void
  setDrivingLockout: (v: boolean) => void
  pushBreadcrumb: (p: GpsPoint) => void
  clearBreadcrumb: () => void
  setNavMode: (mode: 'STANDALONE' | 'PHONE_ASSISTED') => void
  setNavInstruction: (instr: NavInstruction | null) => void
}

export type ClusterScreenId =
  | 'DASHBOARD'
  | 'PERFORMANCE'
  | 'GPS'
  | 'DIAGNOSTICS'
  | 'HEALTH'
  | 'TRIP'
  | 'MEDIA'
  | 'TERRAIN'
  | 'TEST'

interface PersistedVehicleShape {
  trips: TripSummary[]
  telemetry: { odometerKm: TelemetrySnapshot['odometerKm'] }
  parkedLocation: ParkedLocation | null
}

export const useVehicleStore = create<VehicleState>()(
  persist<VehicleState, [], [], PersistedVehicleShape>(
    (set, get) => ({
      ignition: 'OFF',
      engine: 'OFF',
      telemetry: INITIAL_TELEMETRY,
      hardware: initialHardware,
      connections: initialConnections,
      warnings: [],
      dtcs: [],
      health: initialHealth,
      trips: [
        {
          id: 'trip-yesterday',
          label: 'YESTERDAY',
          startedAt: Date.now() - 86400000,
          endedAt: Date.now() - 86400000 + 31 * 60000,
          distanceKm: 18.2,
          timeSeconds: 31 * 60,
          averageSpeedKph: 35,
          maxSpeedKph: 91,
          maxCoolantC: 91,
          maxRpm: 4800,
          warnings: [],
          dtcOccurrences: [],
        },
      ],
      currentScenario: null,
      bootPhase: 'IDLE',
      speedSourceActive: 'OBD',
      activeClusterScreen: 'DASHBOARD',
      drivingLockout: false,
      gpsBreadcrumb: [],
      parkedLocation: null,
      navMode: 'STANDALONE',
      navInstruction: null,

      setIgnition: (state) =>
        set((s) => {
          if (state === 'OFF' && s.ignition !== 'OFF' && s.telemetry.latitude.available) {
            return {
              ignition: state,
              engine: 'OFF',
              bootPhase: 'IDLE',
              parkedLocation: { lat: s.telemetry.latitude.value, lon: s.telemetry.longitude.value, timestamp: Date.now() },
            }
          }
          return state==='OFF'?{ignition:state,engine:'OFF',bootPhase:'IDLE'}:{ ignition: state }
        }),
      setEngine: (state) => set({ engine: state }),
      setTelemetry: (patch) => set((s) => ({ telemetry: { ...s.telemetry, ...patch } })),
      setHardware: (patch) => set((s) => ({ hardware: { ...s.hardware, ...patch } })),
      setConnections: (patch) => set((s) => ({ connections: { ...s.connections, ...patch } })),
      setSpeedSourceActive: (src) => set({ speedSourceActive: src }),

      pushWarning: (w) =>
        set((s) => {
          if (s.warnings.some((existing) => existing.id === w.id)) return s
          return { warnings: [...s.warnings, w] }
        }),
      acknowledgeWarning: (id) =>
        set((s) => ({
          warnings: s.warnings.map((w) => (w.id === id ? { ...w, acknowledged: true } : w)),
        })),
      clearWarning: (id) => set((s) => ({ warnings: s.warnings.filter((w) => w.id !== id) })),
      removeWarningsBySource: (source) =>
        set((s) => ({ warnings: s.warnings.filter((w) => w.source !== source) })),

      addOrUpdateDtc: (dtc) =>
        set((s) => {
          const existingIdx = s.dtcs.findIndex((d) => d.code === dtc.code)
          if (existingIdx >= 0) {
            const copy = [...s.dtcs]
            copy[existingIdx] = { ...copy[existingIdx], ...dtc, lastObserved: Date.now() }
            return { dtcs: copy }
          }
          return { dtcs: [...s.dtcs, dtc] }
        }),
      clearDtc: (code) =>
        set((s) => ({
          dtcs: s.dtcs.map((d) => (d.code === code ? { ...d, status: 'CLEARED' } : d)),
        })),

      setHealth: (categories) => set({ health: categories }),
      updateHealthCategory: (key, patch) =>
        set((s) => ({
          health: s.health.map((h) => (h.key === key ? { ...h, ...patch } : h)),
        })),

      setScenario: (id) => set({ currentScenario: id }),
      setBootPhase: (phase) => set({ bootPhase: phase }),

      finishTrip: () => {
        const s = get()
        const t = s.telemetry
        if (t.tripDistanceKm.value < 0.05) return
        const trip: TripSummary = {
          id: `trip-${Date.now()}`,
          label: 'TODAY',
          startedAt: Date.now() - t.tripTimeSeconds.value * 1000,
          endedAt: Date.now(),
          distanceKm: t.tripDistanceKm.value,
          timeSeconds: t.tripTimeSeconds.value,
          averageSpeedKph: t.averageSpeedKph.value,
          maxSpeedKph: t.maxSpeedKph.value,
          maxCoolantC: t.maxCoolantC.value,
          maxRpm: t.maxRpm.value,
          warnings: s.warnings.map((w) => w.title),
          dtcOccurrences: s.dtcs.map((d) => d.code),
        }
        set({ trips: [trip, ...s.trips] })
      },
      resetTrip: () =>
        set((s) => ({
          telemetry: {
            ...s.telemetry,
            tripDistanceKm: makeChannel(0, 'DERIVED'),
            tripTimeSeconds: makeChannel(0, 'DERIVED'),
            averageSpeedKph: makeChannel(0, 'DERIVED'),
            maxSpeedKph: makeChannel(0, 'DERIVED'),
            maxRpm: makeChannel(0, 'DERIVED'),
            maxCoolantC: makeChannel(0, 'DERIVED'),
            maxBoostBar: makeChannel(0, 'DERIVED'),
          },
        })),
      setActiveClusterScreen: (screen) => set({ activeClusterScreen: screen }),
      setDrivingLockout: (v) => set({ drivingLockout: v }),
      pushBreadcrumb: (p) =>
        set((s) => {
          const next = [...s.gpsBreadcrumb, p]
          if (next.length > 400) next.shift()
          return { gpsBreadcrumb: next }
        }),
      clearBreadcrumb: () => set({ gpsBreadcrumb: [] }),
      setNavMode: (mode) => set({ navMode: mode }),
      setNavInstruction: (instr) => set({ navInstruction: instr }),
    }),
    {
      name: 'retrodrive-vehicle',
      partialize: (s) => ({
        trips: s.trips,
        telemetry: { odometerKm: s.telemetry.odometerKm },
        parkedLocation: s.parkedLocation,
      }),
      merge: (persistedState, current) => {
        const persisted = persistedState as PersistedVehicleShape | undefined
        if (!persisted) return current
        return {
          ...current,
          trips: persisted.trips ?? current.trips,
          telemetry: {
            ...current.telemetry,
            odometerKm: persisted.telemetry?.odometerKm ?? current.telemetry.odometerKm,
          },
          parkedLocation: persisted.parkedLocation ?? current.parkedLocation,
        }
      },
    }
  )
)
