import test from 'node:test'
import assert from 'node:assert/strict'
import { validateTelemetry, isNewerSequence } from '../../shared/telemetry.mjs'
import { simulatedPacket } from '../../tools/vehicle-simulator/simulator.mjs'

test('deterministic scenes retain simulated provenance and valid zero', () => {
  const p = simulatedPacket(0, 'rpm-sweep')
  assert.deepEqual(p, simulatedPacket(0, 'rpm-sweep'))
  assert.equal(p.channels.rpm.value, 0); assert.equal(p.channels.rpm.valid, true)
  assert.ok(Object.values(p.channels).every(s => s.source === 'simulated'))
})
test('null, missing and zero have distinct semantics', () => {
  const p = simulatedPacket(1, 'sensor-loss')
  assert.equal(p.channels.coolantC.value, null); assert.equal(p.channels.coolantC.valid, false)
  assert.equal(p.channels.oilPressureKpa, undefined)
  p.channels.coolantC.value = 0; assert.throws(() => validateTelemetry(p), /Invalid value/)
})
test('reject wrong versions, values, units, ages, unknown channels and nonfinite numbers', () => {
  for (const mutate of [p => p.schemaVersion = 2, p => p.channels.rpm.value = NaN, p => p.channels.rpm.ageMs = -1, p => p.channels.rpm.unit = 'V', p => p.channels.notKnown = p.channels.rpm, p => p.sequence = 2 ** 32, p => p.channels.rpm.extra = true]) {
    const p = simulatedPacket(1); mutate(p); assert.throws(() => validateTelemetry(p))
  }
})
test('sequence wrap accepts new data and rejects duplicates/backward samples', () => {
  assert.equal(isNewerSequence(0, 0xffffffff), true)
  assert.equal(isNewerSequence(5, 5), false)
  assert.equal(isNewerSequence(4, 5), false)
})
