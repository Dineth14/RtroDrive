import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DiffLockState, FourWheelDriveState, TrailSummary, Waypoint } from '@/types/expedition'

interface ExpeditionState {
  pitchDeg: number
  rollDeg: number
  verticalSpeedMps: number
  transmissionTempC: number

  expeditionActive: boolean
  startCoordinate: { lat: number; lon: number } | null
  startedAt: number | null

  waypoints: Waypoint[]
  savedTrails: TrailSummary[]

  fourWheelDrive: FourWheelDriveState
  lowRangeActive: boolean
  diffLock: DiffLockState
  winchActive: boolean

  maxAltitudeM: number
  minAltitudeM: number
  maxPitchDeg: number
  maxRollDeg: number

  inclinometerZeroed: boolean
  pitchOverride: number | null
  rollOverride: number | null

  setPitchRoll: (pitch: number, roll: number, verticalSpeed: number) => void
  setPitchOverride: (v: number | null) => void
  setRollOverride: (v: number | null) => void
  setTransmissionTemp: (v: number) => void
  trackAltitude: (altitudeM: number) => void

  startExpedition: (lat: number, lon: number) => void
  endExpedition: () => TrailSummary | null
  markWaypoint: (lat: number, lon: number, altitudeM: number, name?: string) => Waypoint
  renameWaypoint: (id: string, name: string) => void
  deleteWaypoint: (id: string) => void
  clearWaypoints: () => void
  saveTrail: (name: string, distanceKm: number, durationSeconds: number) => void
  deleteTrail: (id: string) => void

  setFourWheelDrive: (v: FourWheelDriveState) => void
  setLowRange: (v: boolean) => void
  toggleDiffLock: (which: keyof DiffLockState) => void
  setWinch: (v: boolean) => void

  zeroInclinometer: () => void
  resetExpeditionTrip: () => void
}

let waypointCounter = 0

export const useExpeditionStore = create<ExpeditionState>()(
  persist(
    (set, get) => ({
      pitchDeg: 0,
      rollDeg: 0,
      verticalSpeedMps: 0,
      transmissionTempC: 24,

      expeditionActive: false,
      startCoordinate: null,
      startedAt: null,

      waypoints: [],
      savedTrails: [],

      fourWheelDrive: '2H',
      lowRangeActive: false,
      diffLock: { center: false, front: false, rear: false },
      winchActive: false,

      maxAltitudeM: -Infinity,
      minAltitudeM: Infinity,
      maxPitchDeg: 0,
      maxRollDeg: 0,

      inclinometerZeroed: true,
      pitchOverride: null,
      rollOverride: null,

      setPitchRoll: (pitch, roll, verticalSpeed) =>
        set((s) => ({
          pitchDeg: pitch,
          rollDeg: roll,
          verticalSpeedMps: verticalSpeed,
          maxPitchDeg: Math.max(s.maxPitchDeg, Math.abs(pitch)),
          maxRollDeg: Math.max(s.maxRollDeg, Math.abs(roll)),
        })),
      setPitchOverride: (v) => set({ pitchOverride: v }),
      setRollOverride: (v) => set({ rollOverride: v }),
      setTransmissionTemp: (v) => set({ transmissionTempC: v }),
      trackAltitude: (altitudeM) =>
        set((s) => ({
          maxAltitudeM: Math.max(s.maxAltitudeM, altitudeM),
          minAltitudeM: Math.min(s.minAltitudeM, altitudeM),
        })),

      startExpedition: (lat, lon) =>
        set({
          expeditionActive: true,
          startCoordinate: { lat, lon },
          startedAt: Date.now(),
          maxAltitudeM: -Infinity,
          minAltitudeM: Infinity,
          maxPitchDeg: 0,
          maxRollDeg: 0,
        }),
      endExpedition: () => {
        const s = get()
        if (!s.expeditionActive || !s.startedAt) {
          set({ expeditionActive: false })
          return null
        }
        set({ expeditionActive: false })
        return null
      },

      markWaypoint: (lat, lon, altitudeM, name) => {
        waypointCounter += 1
        const wp: Waypoint = {
          id: `wp-${Date.now()}-${waypointCounter}`,
          name: name ?? `WAYPOINT ${String(waypointCounter).padStart(2, '0')}`,
          lat,
          lon,
          altitudeM,
          timestamp: Date.now(),
        }
        set((s) => ({ waypoints: [...s.waypoints, wp] }))
        return wp
      },
      renameWaypoint: (id, name) =>
        set((s) => ({ waypoints: s.waypoints.map((w) => (w.id === id ? { ...w, name } : w)) })),
      deleteWaypoint: (id) => set((s) => ({ waypoints: s.waypoints.filter((w) => w.id !== id) })),
      clearWaypoints: () => set({ waypoints: [] }),

      saveTrail: (name, distanceKm, durationSeconds) =>
        set((s) => ({
          savedTrails: [
            { id: `trail-${Date.now()}`, name, distanceKm, durationSeconds, waypointCount: s.waypoints.length, savedAt: Date.now() },
            ...s.savedTrails,
          ],
        })),
      deleteTrail: (id) => set((s) => ({ savedTrails: s.savedTrails.filter((t) => t.id !== id) })),

      setFourWheelDrive: (v) => set({ fourWheelDrive: v, lowRangeActive: v === '4L' ? get().lowRangeActive : false }),
      setLowRange: (v) => set({ lowRangeActive: v, fourWheelDrive: v ? '4L' : '4H' }),
      toggleDiffLock: (which) => set((s) => ({ diffLock: { ...s.diffLock, [which]: !s.diffLock[which] } })),
      setWinch: (v) => set({ winchActive: v }),

      zeroInclinometer: () => set({ inclinometerZeroed: true }),
      resetExpeditionTrip: () =>
        set({ maxAltitudeM: -Infinity, minAltitudeM: Infinity, maxPitchDeg: 0, maxRollDeg: 0 }),
    }),
    {
      name: 'retrodrive-expedition',
      partialize: (s) => ({ waypoints: s.waypoints, savedTrails: s.savedTrails, fourWheelDrive: s.fourWheelDrive, diffLock: s.diffLock }),
    }
  )
)
