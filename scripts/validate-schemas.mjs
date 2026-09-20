import { readFileSync, readdirSync } from 'node:fs'
import assert from 'node:assert/strict'
import { telemetrySchema, validateTelemetry } from '../shared/telemetry.mjs'
import { simulatedPacket } from '../tools/vehicle-simulator/simulator.mjs'
assert.deepEqual(JSON.parse(readFileSync('shared/schemas/telemetry-v1.json')), telemetrySchema(), 'Generated telemetry schema drift')
const schema = JSON.parse(readFileSync('shared/schemas/vehicle-profile-v1.json'))
for (const file of readdirSync('shared/vehicle-profiles').filter(n => n.endsWith('.json'))) {
  const profile = JSON.parse(readFileSync(`shared/vehicle-profiles/${file}`))
  assert.deepEqual(Object.keys(profile).sort(), schema.required.slice().sort(), file)
  assert.equal(profile.schema_version, 1)
  assert.equal(profile.profile_id, file.replace('.json', ''))
  assert.ok(schema.properties.verification_status.enum.includes(profile.verification_status))
  assert.equal(profile.verification_status, 'unverified', 'Promotion needs an actual verification evidence workflow')
  for (const parameter of profile.supported_parameters) {
    for (const key of schema.$defs.parameter.required) assert.ok(Object.hasOwn(parameter, key), `${file}: missing ${key}`)
    assert.ok(parameter.source.length > 0)
    assert.equal(parameter.verification_status, 'unverified')
  }
  if (profile.profile_id !== 'generic_can') assert.equal(profile.supported_parameters.length, 0, 'No proprietary parameters qualified yet')
}
for (let i = 0; i < 100; i++) validateTelemetry(simulatedPacket(i))
console.log('PASS schema generation, profile invariants and telemetry fixtures (full JSON Schema validation also runs in CI)')
