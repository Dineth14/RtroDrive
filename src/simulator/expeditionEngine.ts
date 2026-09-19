import { useExpeditionStore } from '@/state/expeditionStore'
import { useVehicleStore } from '@/state/vehicleStore'
import { useSettingsStore } from '@/state/settingsStore'
import { getVisualProfile } from '@/vehicleProfiles/profiles'

let prevSpeed = 0
let prevHeading = 0
let prevAltitude = 0
let terrainPitchTimer = 0
let terrainPitchTarget = 0
let terrainRollTimer = 0
let terrainRollTarget = 0

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v))
}
function approach(current: number, target: number, maxDelta: number) {
  const diff = target - current
  if (Math.abs(diff) <= maxDelta) return target
  return current + Math.sign(diff) * maxDelta
}

export function stepExpedition(dtSeconds: number) {
  const expStore = useExpeditionStore.getState()
  const vehicleStore = useVehicleStore.getState()
  const vehicle = useSettingsStore.getState().vehicleProfile
  const visual = getVisualProfile(vehicle)
  const t = vehicleStore.telemetry
  const running = vehicleStore.engine === 'RUNNING' || vehicleStore.engine === 'IDLE'
  const speed = t.speedKph.value
  const heading = t.headingDeg.value
  const altitude = t.altitudeM.value
  const load = t.engineLoadPercent.value

  // ---- Terrain-noise wander (independent of accel/turn, gives "off-road" character) ----
  terrainPitchTimer -= dtSeconds
  if (terrainPitchTimer <= 0) {
    terrainPitchTimer = 1.5 + Math.random() * 3
    const amplitude = visual.supportsOffRoadMode ? 12 : 2
    terrainPitchTarget = (Math.random() - 0.5) * 2 * amplitude
  }
  terrainRollTimer -= dtSeconds
  if (terrainRollTimer <= 0) {
    terrainRollTimer = 1.2 + Math.random() * 2.5
    const amplitude = visual.supportsOffRoadMode ? 10 : 1.5
    terrainRollTarget = (Math.random() - 0.5) * 2 * amplitude
  }

  // ---- Acceleration-driven pitch, turn-rate-driven roll ----
  const speedDelta = speed - prevSpeed
  const accelSignal = running ? clamp((speedDelta / Math.max(dtSeconds, 0.001)) / 8, -1, 1) : 0
  let headingDelta = heading - prevHeading
  if (headingDelta > 180) headingDelta -= 360
  if (headingDelta < -180) headingDelta += 360
  const turnRate = running ? clamp(headingDelta / Math.max(dtSeconds, 0.001) / 25, -1, 1) : 0

  const dynamicPitch = -accelSignal * 6
  const dynamicRoll = turnRate * 8

  const rawPitch = clamp(dynamicPitch + terrainPitchTarget * (running ? 1 : 0.15), -35, 35)
  const rawRoll = clamp(dynamicRoll + terrainRollTarget * (running ? 1 : 0.15), -30, 30)

  const currentPitch = expStore.pitchOverride ?? approach(expStore.pitchDeg, rawPitch, 18 * dtSeconds)
  const currentRoll = expStore.rollOverride ?? approach(expStore.rollDeg, rawRoll, 18 * dtSeconds)

  const verticalSpeed = dtSeconds > 0 ? (altitude - prevAltitude) / dtSeconds : 0
  expStore.setPitchRoll(currentPitch, currentRoll, verticalSpeed)
  expStore.trackAltitude(altitude)

  // ---- Transmission temp: thermal model similar to oil temp ----
  const ambientC = 26
  const target = running ? clamp(70 + load * 0.35 + (expStore.lowRangeActive ? 15 : 0), 70, 135) : ambientC
  const nextTrans = approach(expStore.transmissionTempC, target, (running ? 1.2 : 0.5) * dtSeconds)
  expStore.setTransmissionTemp(nextTrans)

  // ---- Winch draws down battery voltage while active ----
  if (expStore.winchActive) {
    vehicleStore.setTelemetry({
      batteryVoltage: { value: clamp(t.batteryVoltage.value - 0.4 * dtSeconds, 10.5, 14.4), available: true, source: 'DERIVED' },
    })
  }

  prevSpeed = speed
  prevHeading = heading
  prevAltitude = altitude
}
