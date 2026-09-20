import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import { parseRecording, RecordedTelemetrySource } from '../src/data/RecordedTelemetrySource'
import { SourceLivePanel } from '../src/data/SourceLivePanel'
import { WebSocketTelemetrySource } from '../src/data/WebSocketTelemetrySource'
import { simulatedPacket } from '../../../tools/vehicle-simulator/simulator.mjs'

const records = [simulatedPacket(0), simulatedPacket(1)]
assert.equal(parseRecording(records.map(p => JSON.stringify(p)).join('\n')).length, 2)
assert.throws(() => parseRecording(''))
assert.throws(() => parseRecording(JSON.stringify(records[1]) + '\n' + JSON.stringify(records[0])))
assert.throws(() => parseRecording(JSON.stringify(records[0]) + '\n' + JSON.stringify({...records[1], sessionId:'other'})))
assert.throws(() => new WebSocketTelemetrySource('https://localhost'))
const stale = {...records[0], channels: { coolantC: {value: 123, valid:true, source:'obd', ageMs:4000, unit:'degC'} }}
const html = renderToStaticMarkup(<SourceLivePanel packet={stale as any} status="receiving" receivedAt={performance.now()}/>)
assert.ok(html.includes('No fresh measurements')); assert.ok(!html.includes('123'))
const zero = {...records[0], channels: { rpm: {value:0, valid:true, source:'obd', ageMs:0, unit:'rpm'} }}
assert.ok(renderToStaticMarkup(<SourceLivePanel packet={zero as any} status="receiving" receivedAt={performance.now()}/>).includes('0 <small>rpm'))
let emitted = 0
const replay = new RecordedTelemetrySource(records)
replay.start(() => emitted++, () => {})
assert.equal(emitted, 1); replay.stop()
setTimeout(() => { assert.equal(emitted, 1); console.log('PASS source parsing, ordering, validity, zero and replay cancellation') }, 150)
