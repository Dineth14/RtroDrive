import { useVehicleStore } from '@/state/vehicleStore'
import { useSettingsStore } from '@/state/settingsStore'
import { useMediaStore } from '@/state/mediaStore'
import { makeChannel } from '@/types/telemetry'
import type { TelemetrySnapshot } from '@/types/telemetry'
import { stepBoost } from './boost'

type OverridableChannel =
  | 'speedKph'
  | 'rpm'
  | 'coolantTempC'
  | 'intakeTempC'
  | 'batteryVoltage'
  | 'fuelPercent'
  | 'shortFuelTrimPercent'
  | 'longFuelTrimPercent'
  | 'engineLoadPercent'
  | 'oilPressureBar'
  | 'boostBar'
  | 'mapAbsoluteKpa'
  | 'barometricPressureKpa'
  | 'headingDeg'
  | 'latitude'
  | 'longitude'
  | 'satelliteCount'
  | 'gpsAccuracyM'

type OverrideMap = Partial<Record<OverridableChannel, number>>

const overrides: OverrideMap = {}
const forcedUnavailable = new Set<OverridableChannel>()
let boostSpool = 0
let physicalSpeed = 0
let breadcrumbTimer = 0

export function setForcedUnavailable(channel: OverridableChannel, unavailable: boolean) {
  if (unavailable) forcedUnavailable.add(channel)
  else forcedUnavailable.delete(channel)
}

let autoTargetSpeed = 0
let autoTargetTimer = 0

let lastTickAt = performance.now()
let intervalHandle: number | null = null
let spectrumHandle: number | null = null
let secondAccumulator = 0

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v))
}
function approach(current: number, target: number, maxDelta: number) {
  const diff = target - current
  if (Math.abs(diff) <= maxDelta) return target
  return current + Math.sign(diff) * maxDelta
}
function noise(amount: number) {
  return (Math.random() - 0.5) * 2 * amount
}

export function setOverride(channel: OverridableChannel, value: number) {
  overrides[channel] = value
}
export function clearOverride(channel: OverridableChannel) {
  delete overrides[channel]
}
export function clearAllOverrides() {
  for (const key of Object.keys(overrides)) delete overrides[key as OverridableChannel]
}
export function getOverrides(): Readonly<OverrideMap> {
  return overrides
}

export function stepTelemetry(dtSeconds: number) {
  const store = useVehicleStore.getState()
  const { ignition, engine, telemetry } = store
  const t: TelemetrySnapshot = telemetry
  const running = engine === 'RUNNING' || engine === 'IDLE'
  const driving = engine === 'RUNNING'
  const cranking = ignition === 'START'

  const next: Partial<TelemetrySnapshot> = {}

  // ---- Speed & RPM ----
  let speed = physicalSpeed
  const previousSpeed=physicalSpeed
  let rpm = t.rpm.value

  if (running || cranking) {
    if (overrides.speedKph !== undefined) {
      autoTargetSpeed = overrides.speedKph
    } else {
      autoTargetTimer -= dtSeconds
      if (autoTargetTimer <= 0) {
        autoTargetTimer = 4 + Math.random() * 6
        const wander = noise(28)
        autoTargetSpeed = clamp(autoTargetSpeed + wander, 0, 140)
      }
    }
    const targetSpeed = driving ? clamp(autoTargetSpeed, 0, 220) : 0
    const accelRate = targetSpeed > speed ? 22 : 34 // km/h per second
    speed = cranking ? 0 : approach(speed, targetSpeed, accelRate * dtSeconds)

    if (overrides.rpm !== undefined) {
      rpm = approach(rpm, overrides.rpm, 4000 * dtSeconds)
    } else if (cranking) {
      rpm = approach(rpm, 280, 2000 * dtSeconds)
    } else {
      const idleRpm = 780
      const speedDerivedRpm = idleRpm + speed * 34
      const targetRpm = clamp(speedDerivedRpm, idleRpm, 6800)
      rpm = approach(rpm, targetRpm, 3200 * dtSeconds)
      rpm += noise(12)
    }
  } else {
    speed = approach(speed, 0, 40 * dtSeconds)
    rpm = approach(rpm, 0, 2500 * dtSeconds)
  }
  next.speedKph = makeChannel(Math.max(0, speed), 'OBD', ignition !== 'OFF')
  physicalSpeed=speed
  next.rpm = makeChannel(Math.max(0, Math.round(rpm)), 'OBD', ignition !== 'OFF')

  // ---- Throttle & load ----
  const speedDelta = speed - previousSpeed
  const accelSignal = clamp((speedDelta / Math.max(dtSeconds, 0.001)) / 8, -1, 1)
  const throttle = running ? speed<1&&Math.abs(speedDelta)<.1 ? 6 : clamp(20 + accelSignal * 60 + (rpm / 6800) * 15, 0, 100) : 0
  next.throttlePercent = makeChannel(throttle, 'OBD', running)

  const load =
    overrides.engineLoadPercent !== undefined
      ? overrides.engineLoadPercent
      : running
        ? clamp(14 + throttle * 0.55 + (rpm / 6800) * 20, 5, 98)
        : 0
  next.engineLoadPercent = makeChannel(load, 'OBD', running)

  // ---- Coolant / IAT / oil ----
  const ambientC = 26
  if (overrides.coolantTempC !== undefined) {
    const coolant = approach(t.coolantTempC.value, overrides.coolantTempC, 6 * dtSeconds)
    next.coolantTempC = makeChannel(coolant, 'OBD', ignition !== 'OFF')
  } else {
    const equilibrium = running ? clamp(88 + load * 0.09, 88, 100) : ambientC
    const rate = running ? 1.1 : 0.4
    const coolant = approach(t.coolantTempC.value, equilibrium, rate * dtSeconds)
    next.coolantTempC = makeChannel(coolant, 'OBD', ignition !== 'OFF')
  }
  if (forcedUnavailable.has('coolantTempC')) {
    next.coolantTempC = makeChannel(t.coolantTempC.value, 'OBD', false)
  }

  if (overrides.intakeTempC !== undefined) {
    next.intakeTempC = makeChannel(overrides.intakeTempC, 'OBD', ignition !== 'OFF')
  } else {
    const iatTarget = ambientC + (running ? clamp(load * 0.12, 2, 22) : 0)
    next.intakeTempC = makeChannel(approach(t.intakeTempC.value, iatTarget, 2 * dtSeconds) + noise(0.3), 'OBD', ignition !== 'OFF')
  }

  if (overrides.oilPressureBar !== undefined) {
    next.oilPressureBar = makeChannel(overrides.oilPressureBar, 'OBD', running)
  } else {
    const oilTarget = running ? clamp(1.0 + (rpm / 6800) * 3.6, 0.8, 5.2) : 0
    next.oilPressureBar = makeChannel(approach(t.oilPressureBar.value, oilTarget, 3 * dtSeconds), 'OBD', running)
  }
  next.oilTempC = makeChannel(
    approach(t.oilTempC.value, running ? clamp(90 + load * 0.15, 90, 118) : ambientC, 0.8 * dtSeconds),
    'OBD',
    running
  )

  // ---- Battery ----
  if (overrides.batteryVoltage !== undefined) {
    next.batteryVoltage = makeChannel(overrides.batteryVoltage, 'OBD', ignition !== 'OFF')
  } else if (cranking) {
    next.batteryVoltage = makeChannel(10.2 + noise(0.3), 'OBD', true)
  } else if (running) {
    const target = clamp(14.2 - load * 0.006, 13.5, 14.4)
    next.batteryVoltage = makeChannel(approach(t.batteryVoltage.value, target, 0.6 * dtSeconds) + noise(0.02), 'OBD', true)
  } else if (ignition !== 'OFF') {
    next.batteryVoltage = makeChannel(approach(t.batteryVoltage.value, 12.6, 0.3 * dtSeconds), 'OBD', true)
  } else {
    next.batteryVoltage = makeChannel(approach(t.batteryVoltage.value, 12.5, 0.05 * dtSeconds), 'OBD', false)
  }

  // ---- Fuel ----
  if (overrides.fuelPercent !== undefined) {
    next.fuelPercent = makeChannel(overrides.fuelPercent, 'OBD', true)
  } else {
    const consumption = running ? (0.0006 + load * 0.000018) * dtSeconds : 0
    next.fuelPercent = makeChannel(clamp(t.fuelPercent.value - consumption, 0, 100), 'OBD', true)
  }

  // ---- Fuel trims ----
  if (overrides.shortFuelTrimPercent !== undefined) {
    next.shortFuelTrimPercent = makeChannel(overrides.shortFuelTrimPercent, 'OBD', running)
  } else {
    next.shortFuelTrimPercent = makeChannel(clamp(noise(3), -8, 8), 'OBD', running)
  }
  if (overrides.longFuelTrimPercent !== undefined) {
    next.longFuelTrimPercent = makeChannel(overrides.longFuelTrimPercent, 'OBD', running)
  } else {
    next.longFuelTrimPercent = makeChannel(clamp(t.longFuelTrimPercent.value * 0.9 + noise(1.5), -8, 8), 'OBD', running)
  }

  // ---- MAP / MAF ----
  const mapTarget = running ? clamp(100 - throttle * 0.65, 25, 100) : 30
  next.mapKpa = makeChannel(approach(t.mapKpa.value, mapTarget, 20 * dtSeconds), 'OBD', running)
  const mafTarget = running ? clamp(2 + (rpm / 6800) * 60 * (0.4 + load / 160), 1, 90) : 0
  next.mafGps = makeChannel(approach(t.mafGps.value, mafTarget, 15 * dtSeconds), 'OBD', running)
  next.fuelPressureBar = makeChannel(running ? 3.1 + noise(0.08) : 0, 'OBD', running)

  // ---- Boost / turbo (vacuum + positive boost off one MAP model) ----
  const vehicle = useSettingsStore.getState().vehicleProfile
  const isTurbo = vehicle.isTurbocharged
  const baro = overrides.barometricPressureKpa ?? approach(t.barometricPressureKpa.value, 101.3, 2 * dtSeconds)

  let boostKpa: number
  if (overrides.boostBar !== undefined) {
    boostSpool = isTurbo ? clamp(overrides.boostBar / Math.max(0.1, vehicle.maxBoostBar), 0, 1.3) : 0
    boostKpa = approach(t.boostKpa.value, overrides.boostBar * 100, 400 * dtSeconds)
  } else if (overrides.mapAbsoluteKpa !== undefined) {
    boostKpa = approach(t.boostKpa.value, overrides.mapAbsoluteKpa - baro, 200 * dtSeconds)
  } else {
    boostKpa = stepBoost(t.boostKpa.value,rpm,throttle,load,isTurbo,vehicle.maxBoostBar,running,dtSeconds)
  }
  const boostAvailable = running && isTurbo
  next.barometricPressureKpa = makeChannel(baro, 'DERIVED', true)
  next.mapAbsoluteKpa = makeChannel(baro + boostKpa, 'DERIVED', running)
  next.boostKpa = makeChannel(boostKpa, 'DERIVED', boostAvailable)
  next.boostBar = makeChannel(boostKpa / 100, 'DERIVED', boostAvailable)
  next.boostPsi = makeChannel(boostKpa * 0.145038, 'DERIVED', boostAvailable)
  next.maxBoostBar = makeChannel(Math.max(t.maxBoostBar.value, boostKpa / 100), 'DERIVED')

  // ---- Gear (cosmetic, speed-derived) ----
  next.gearPosition = makeChannel(
    !running ? (ignition === 'OFF' ? 'P' : 'N') : speed < 2 ? 'N' : String(Math.min(6, Math.max(1, Math.ceil(speed / 28)))),
    'DERIVED',
    true
  )

  // ---- GPS ----
  const gps = store.connections.gps
  const gpsAvailable = gps === 'FIX'
  next.gpsSpeedKph = makeChannel(gpsAvailable ? clamp(next.speedKph.value + noise(1.5), 0, 240) : t.gpsSpeedKph.value, 'GPS', gpsAvailable)
  next.satelliteCount = makeChannel(gpsAvailable ? overrides.satelliteCount ?? 8 + Math.round(Math.random() * 4) : 0, 'GPS', gpsAvailable)
  next.gpsAccuracyM = makeChannel(gpsAvailable ? overrides.gpsAccuracyM ?? 2.5 + Math.random() * 2 : 0, 'GPS', gpsAvailable)
  if (gpsAvailable) {
    const headingRad = ((t.headingDeg.value % 360) * Math.PI) / 180
    const distanceDeg = (next.gpsSpeedKph.value * dtSeconds) / 3600 / 111
    next.latitude = makeChannel(overrides.latitude ?? t.latitude.value + Math.cos(headingRad) * distanceDeg, 'GPS', true)
    next.longitude = makeChannel(overrides.longitude ?? t.longitude.value + Math.sin(headingRad) * distanceDeg / Math.max(.01,Math.cos(t.latitude.value*Math.PI/180)), 'GPS', true)
    const nextHeading = overrides.headingDeg !== undefined ? overrides.headingDeg : t.headingDeg.value + noise(2)
    next.headingDeg = makeChannel((nextHeading + 360) % 360, 'GPS', true)
  } else {
    next.latitude = {...t.latitude, available:false}
    next.longitude = {...t.longitude, available:false}
    next.headingDeg = {...t.headingDeg, available:false}
  }
  next.altitudeM = makeChannel(gpsAvailable ? t.altitudeM.value + noise(0.2) : t.altitudeM.value, 'GPS', gpsAvailable)

  if (gpsAvailable && ignition !== 'OFF') {
    breadcrumbTimer += dtSeconds
    if (breadcrumbTimer >= 2) {
      breadcrumbTimer = 0
      store.pushBreadcrumb({ lat: next.latitude.value, lon: next.longitude.value, t: Date.now() })
    }
  }

  // ---- Speed source resolution ----
  const obdOk = store.connections.obd === 'CONNECTED'
  const mode=useSettingsStore.getState().display.speedSourceMode
  const useGps=mode==='GPS'||(mode==='AUTO'&&!obdOk&&gpsAvailable)
  const speedAvailable=useGps?gpsAvailable:obdOk
  const resolvedSpeed=speedAvailable?(useGps?next.gpsSpeedKph.value:next.speedKph.value):0
  store.setSpeedSourceActive(useGps?'GPS':'OBD')
  next.speedKph=makeChannel(resolvedSpeed,useGps?'GPS':'OBD',speedAvailable)

  // ---- Trip accumulators ----
  const distDelta = (resolvedSpeed * dtSeconds) / 3600
  const newTripDistance = t.tripDistanceKm.value + (running ? distDelta : 0)
  const newTripTime = t.tripTimeSeconds.value + (running ? dtSeconds : 0)
  next.tripDistanceKm = makeChannel(newTripDistance, 'DERIVED')
  next.tripTimeSeconds = makeChannel(newTripTime, 'DERIVED')
  next.averageSpeedKph = makeChannel(newTripTime > 1 ? (newTripDistance / newTripTime) * 3600 : 0, 'DERIVED')
  next.maxSpeedKph = makeChannel(Math.max(t.maxSpeedKph.value, resolvedSpeed), 'DERIVED')
  next.maxRpm = makeChannel(Math.max(t.maxRpm.value, next.rpm.value), 'DERIVED')
  next.maxCoolantC = makeChannel(Math.max(t.maxCoolantC.value, next.coolantTempC.value), 'DERIVED')
  next.odometerKm = makeChannel(t.odometerKm.value + (running ? distDelta : 0), 'DERIVED')

  store.setTelemetry(next)
}

export function startTelemetryEngine() {
  if (intervalHandle !== null) return
  lastTickAt = performance.now()
  let audioLast=performance.now()
  spectrumHandle=window.setInterval(()=>{const now=performance.now();useMediaStore.getState().tick(Math.min(.2,(now-audioLast)/1000));audioLast=now},40)
  intervalHandle = window.setInterval(() => {
    const now = performance.now()
    const dt = Math.min(0.5, (now - lastTickAt) / 1000)
    lastTickAt = now
    stepTelemetry(dt)

    secondAccumulator += dt
    if (secondAccumulator >= 1) {
      secondAccumulator = 0
      import('./faultEngine').then((m) => m.evaluateFaultsAndHealth())
    }
  }, 80)
}

export function stopTelemetryEngine() {
  if(spectrumHandle!==null){window.clearInterval(spectrumHandle);spectrumHandle=null}
  if (intervalHandle !== null) {
    window.clearInterval(intervalHandle)
    intervalHandle = null
  }
}

export function resetAutoDrive() {
  autoTargetSpeed = 0
  autoTargetTimer = 0
  boostSpool = 0
  physicalSpeed = useVehicleStore.getState().telemetry.speedKph.value
}

export function resetBoostPeak() {
  useVehicleStore.getState().setTelemetry({ maxBoostBar: makeChannel(0, 'DERIVED') })
}
