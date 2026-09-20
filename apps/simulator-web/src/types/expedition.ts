export interface Waypoint {
  id: string
  name: string
  lat: number
  lon: number
  altitudeM: number
  timestamp: number
}

export interface TrailSummary {
  id: string
  name: string
  distanceKm: number
  durationSeconds: number
  waypointCount: number
  savedAt: number
}

export type FourWheelDriveState = '2H' | '4H' | '4L'

export interface DiffLockState {
  center: boolean
  front: boolean
  rear: boolean
}

export interface ExpeditionTripSummary {
  distanceKm: number
  durationSeconds: number
  maxAltitudeM: number
  minAltitudeM: number
  maxPitchDeg: number
  maxRollDeg: number
  maxCoolantC: number
  maxBoostBar: number
  waypointCount: number
}
