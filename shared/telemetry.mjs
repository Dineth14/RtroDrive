import protocol from './protocol/ble-v1.json' with { type: 'json' }

export const CHANNELS = Object.freeze(Object.fromEntries(protocol.fastTelemetry.channels.map(c => [c.name, c])))
export const SOURCES = Object.freeze(['obd', 'gnss', 'imu', 'external', 'derived', 'simulated'])
const states = ['disconnected', 'connecting', 'connected', 'fault']
const ignitions = ['unknown', 'off', 'acc', 'on', 'start']
const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v)
const integer = v => Number.isSafeInteger(v) && v >= 0
const exact = (v, keys) => Object.keys(v).every(k => keys.includes(k)) && keys.every(k => Object.hasOwn(v, k))

/** Complete snapshot; absent channels are unsupported, never copied from an older snapshot. */
export function validateTelemetry(packet) {
  if (!isObject(packet)) throw new Error('Telemetry must be an object')
  const keys = ['schemaVersion', 'type', 'sessionId', 'sequence', 'timestampMs', 'connectionState', 'vehicleProfile', 'ignition', 'engineRunning', 'channels']
  if (!exact(packet, keys)) throw new Error('Unexpected or missing telemetry fields')
  if (packet.schemaVersion !== 1 || packet.type !== 'telemetry') throw new Error('Unsupported schema/type')
  if (typeof packet.sessionId !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(packet.sessionId)) throw new Error('Invalid session')
  if (!integer(packet.sequence) || packet.sequence > 0xffffffff || !integer(packet.timestampMs)) throw new Error('Invalid sequence/time')
  if (typeof packet.vehicleProfile !== 'string' || !/^[a-z0-9_-]{1,64}$/.test(packet.vehicleProfile)) throw new Error('Invalid profile')
  if (!states.includes(packet.connectionState) || !ignitions.includes(packet.ignition) || typeof packet.engineRunning !== 'boolean') throw new Error('Invalid connection metadata')
  if (!isObject(packet.channels) || Object.keys(packet.channels).length > 64) throw new Error('Invalid channels')
  for (const [name, sample] of Object.entries(packet.channels)) {
    const spec = CHANNELS[name]
    if (!spec || !isObject(sample) || !exact(sample, ['value', 'valid', 'source', 'ageMs', 'unit'])) throw new Error(`Invalid channel: ${name}`)
    if (typeof sample.valid !== 'boolean' || !SOURCES.includes(sample.source) || !integer(sample.ageMs) || sample.unit !== spec.unit) throw new Error(`Invalid metadata: ${name}`)
    if (sample.valid ? typeof sample.value !== 'number' || !Number.isFinite(sample.value) || sample.value < spec.min || sample.value > spec.max : sample.value !== null) throw new Error(`Invalid value: ${name}`)
  }
  return packet
}

export function sample(name, value, source = 'simulated', ageMs = 0) {
  if (!CHANNELS[name]) throw new Error(`Unknown channel ${name}`)
  return { value, valid: value !== null, source, ageMs, unit: CHANNELS[name].unit }
}

export function isNewerSequence(next, previous) {
  const delta = (next - previous) >>> 0
  return delta !== 0 && delta < 0x80000000
}

export function telemetrySchema() {
  const channels = Object.fromEntries(Object.entries(CHANNELS).map(([name, c]) => [name, {
    type: 'object', additionalProperties: false, required: ['value', 'valid', 'source', 'ageMs', 'unit'],
    properties: { value: { type: ['number', 'null'], minimum: c.min, maximum: c.max }, valid: { type: 'boolean' }, source: { enum: SOURCES }, ageMs: { type: 'integer', minimum: 0, maximum: Number.MAX_SAFE_INTEGER }, unit: { const: c.unit } },
    allOf: [{ if: { properties: { valid: { const: false } } }, then: { properties: { value: { type: 'null' } } }, else: { properties: { value: { type: 'number' } } } }],
  }]))
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema', $id: 'https://retrodrive.local/schemas/telemetry-v1.json', title: 'RetroDrive telemetry snapshot v1',
    type: 'object', additionalProperties: false,
    required: ['schemaVersion', 'type', 'sessionId', 'sequence', 'timestampMs', 'connectionState', 'vehicleProfile', 'ignition', 'engineRunning', 'channels'],
    properties: { schemaVersion: { const: 1 }, type: { const: 'telemetry' }, sessionId: { type: 'string', pattern: '^[A-Za-z0-9_-]{1,64}$' }, sequence: { type: 'integer', minimum: 0, maximum: 0xffffffff }, timestampMs: { type: 'integer', minimum: 0, maximum: Number.MAX_SAFE_INTEGER }, connectionState: { enum: states }, vehicleProfile: { type: 'string', pattern: '^[a-z0-9_-]{1,64}$' }, ignition: { enum: ignitions }, engineRunning: { type: 'boolean' }, channels: { type: 'object', additionalProperties: false, maxProperties: 64, properties: channels } },
  }
}
