export type TelemetrySource = 'OBD' | 'GPS' | 'EXTERNAL_SENSOR' | 'DERIVED' | 'SIMULATED'

export interface TelemetryChannel<T> {
  value: T
  available: boolean
  source: TelemetrySource
}

function chan<T>(value: T, source: TelemetrySource, available = true): TelemetryChannel<T> {
  return { value, available, source }
}

export const makeChannel = chan

export interface TelemetrySnapshot {
  speedKph: TelemetryChannel<number>
  rpm: TelemetryChannel<number>
  coolantTempC: TelemetryChannel<number>
  intakeTempC: TelemetryChannel<number>
  engineLoadPercent: TelemetryChannel<number>
  throttlePercent: TelemetryChannel<number>
  batteryVoltage: TelemetryChannel<number>
  fuelPercent: TelemetryChannel<number>
  mapKpa: TelemetryChannel<number>
  mafGps: TelemetryChannel<number>
  shortFuelTrimPercent: TelemetryChannel<number>
  longFuelTrimPercent: TelemetryChannel<number>
  oilPressureBar: TelemetryChannel<number>
  oilTempC: TelemetryChannel<number>
  fuelPressureBar: TelemetryChannel<number>

  latitude: TelemetryChannel<number>
  longitude: TelemetryChannel<number>
  gpsSpeedKph: TelemetryChannel<number>
  headingDeg: TelemetryChannel<number>
  satelliteCount: TelemetryChannel<number>
  gpsAccuracyM: TelemetryChannel<number>

  odometerKm: TelemetryChannel<number>
  tripDistanceKm: TelemetryChannel<number>
  tripTimeSeconds: TelemetryChannel<number>
  averageSpeedKph: TelemetryChannel<number>
  maxSpeedKph: TelemetryChannel<number>
  maxRpm: TelemetryChannel<number>
  maxCoolantC: TelemetryChannel<number>

  mapAbsoluteKpa: TelemetryChannel<number>
  barometricPressureKpa: TelemetryChannel<number>
  boostKpa: TelemetryChannel<number>
  boostBar: TelemetryChannel<number>
  boostPsi: TelemetryChannel<number>
  maxBoostBar: TelemetryChannel<number>

  altitudeM: TelemetryChannel<number>
  gearPosition: TelemetryChannel<string>
}

export interface GpsPoint {
  lat: number
  lon: number
  t: number
}

export interface ParkedLocation {
  lat: number
  lon: number
  timestamp: number
}

export type NavInstructionKind = 'STRAIGHT' | 'TURN_LEFT' | 'TURN_RIGHT' | 'SLIGHT_LEFT' | 'U_TURN' | 'ROUNDABOUT' | 'DESTINATION'

export interface NavInstruction {
  kind: NavInstructionKind
  distanceM: number
  roundaboutExit?: number
  destinationEtaMin?: number
  destinationDistanceKm?: number
}

export type IgnitionState = 'OFF' | 'ACC' | 'ON' | 'START'
export type EngineState = 'OFF' | 'IDLE' | 'RUNNING'
export type ConnectionState = 'CONNECTED' | 'CONNECTING' | 'UNAVAILABLE' | 'FAULT'
export type GpsState = 'FIX' | 'SEARCHING' | 'LOST'
export type SpeedSourceMode = 'AUTO' | 'OBD' | 'GPS'

export interface HardwareState {
  can: ConnectionState
  obdProtocol: ConnectionState
  gnss: ConnectionState
  sdCard: ConnectionState
  rtc: ConnectionState
  bluetooth: ConnectionState
  wifi: ConnectionState
  audio: ConnectionState
}

export interface ConnectionStates {
  obd: ConnectionState
  gps: GpsState
  phone: ConnectionState
  audio: ConnectionState
}

export interface TripSummary {
  id: string
  label: string
  startedAt: number
  endedAt: number | null
  distanceKm: number
  timeSeconds: number
  averageSpeedKph: number
  maxSpeedKph: number
  maxCoolantC: number
  maxRpm: number
  warnings: string[]
  dtcOccurrences: string[]
}

export type WarningSeverity = 'INFO' | 'ADVISORY' | 'WARNING' | 'CRITICAL'

export interface ActiveWarning {
  id: string
  severity: WarningSeverity
  title: string
  detail: string
  value?: string
  acknowledged: boolean
  createdAt: number
  source: string
}
