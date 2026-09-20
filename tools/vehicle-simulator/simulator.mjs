import { sample, validateTelemetry } from '../../shared/telemetry.mjs'

/** Deterministic scene generator. No vehicle hardware is accessed. */
export function simulatedPacket(sequence, scenario = 'cruise', sessionId = 'simulator') {
  const seconds = sequence / 10
  const speed = 45 + 25 * Math.sin(seconds / 12)
  const channels = {
    rpm: sample('rpm', Math.round(800 + speed * 42)), speedKph: sample('speedKph', speed),
    coolantC: sample('coolantC', scenario === 'temperature-ramp' ? Math.min(125, 75 + seconds) : 87),
    batteryVoltage: sample('batteryVoltage', scenario === 'voltage-drop' ? Math.max(9, 14.2 - seconds / 4) : 14.2),
    throttlePct: sample('throttlePct', 20 + 10 * Math.sin(seconds / 5)), engineLoadPct: sample('engineLoadPct', 35),
    mapKpa: sample('mapKpa', 52), intakeAirC: sample('intakeAirC', 32),
    latitude: sample('latitude', 6.9271 + Math.sin(seconds / 60) * 0.001),
    longitude: sample('longitude', 79.8612 + Math.cos(seconds / 60) * 0.001),
    altitudeM: sample('altitudeM', 12 + Math.sin(seconds / 10)), gpsSpeedKph: sample('gpsSpeedKph', speed),
    headingDeg: sample('headingDeg', (seconds * 3) % 360), satellites: sample('satellites', 12),
    pitchDeg: sample('pitchDeg', Math.sin(seconds / 3) * 6), rollDeg: sample('rollDeg', Math.cos(seconds / 4) * 8),
  }
  if (scenario === 'rpm-sweep') channels.rpm = sample('rpm', Math.round((seconds % 10) * 750))
  if (scenario === 'sensor-loss') channels.coolantC = sample('coolantC', null)
  return validateTelemetry({ schemaVersion: 1, type: 'telemetry', sessionId, sequence, timestampMs: sequence * 100, connectionState: 'connected', vehicleProfile: 'generic_can', ignition: 'on', engineRunning: true, channels })
}

export const SCENARIOS = ['cruise', 'temperature-ramp', 'voltage-drop', 'rpm-sweep', 'sensor-loss']
