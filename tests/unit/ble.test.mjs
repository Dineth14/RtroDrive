import test from 'node:test'
import assert from 'node:assert/strict'
import { crc16,encodeEnvelope,decodeEnvelope,encodeFastTelemetry,decodeFastTelemetry,fragment,Reassembler } from '../../shared/protocol/ble-codec.mjs'

const entries=[{id:1,value:0,valid:true,source:'obd',ageMs:0},{id:3,value:-12.5,valid:true,source:'simulated',ageMs:5},{id:4,value:null,valid:false,source:'obd',ageMs:90000}]
test('BLE CRC known vector and typed telemetry distinguish zero and invalid',()=>{
  assert.equal(crc16(new TextEncoder().encode('123456789')),0x29b1)
  const decoded=decodeFastTelemetry(encodeFastTelemetry(entries))
  assert.equal(decoded.rpm.value,0);assert.equal(decoded.rpm.valid,true)
  assert.equal(decoded.coolantC.value,-12.5);assert.equal(decoded.intakeAirC.value,null);assert.equal(decoded.intakeAirC.ageMs,65535)
})
test('BLE envelope rejects CRC, length and stale sessions',()=>{
  const bytes=encodeEnvelope({messageId:257,sequence:65535,sessionId:10,uptimeMs:0,payload:encodeFastTelemetry(entries)})
  assert.equal(decodeEnvelope(bytes,10).sequence,65535)
  assert.throws(()=>decodeEnvelope(bytes,11),/Old session/)
  const corrupt=bytes.slice();corrupt[18]^=1;assert.throws(()=>decodeEnvelope(corrupt),/CRC/)
  assert.throws(()=>decodeEnvelope(bytes.slice(1)))
})
test('minimum MTU fragments reassemble reversed and duplicate chunks with bounds',()=>{
  const bytes=encodeEnvelope({messageId:257,sequence:1,sessionId:10,uptimeMs:0,payload:encodeFastTelemetry(entries)})
  const chunks=fragment(bytes), receiver=new Reassembler();let result
  assert.ok(chunks.every(chunk=>chunk.length<=20))
  receiver.feed(chunks.at(-1),0)
  for(const chunk of chunks.slice().reverse()) result=receiver.feed(chunk,1)
  assert.deepEqual(result,bytes)
  receiver.feed(chunks[0],10);const conflict=chunks[0].slice();conflict[6]^=1
  assert.throws(()=>receiver.feed(conflict,11),/Conflicting/)
  receiver.feed(chunks[0],20);receiver.feed(chunks[1],2021)
  assert.equal(receiver.transfers.size,1)
  assert.equal(receiver.transfers.values().next().value.count,chunks[1].length-6)
})
test('bad channel values, duplicated channels and reserved bits rejected',()=>{
  assert.throws(()=>encodeFastTelemetry([entries[0],entries[0]]))
  assert.throws(()=>encodeFastTelemetry([{...entries[0],value:-1}]))
  const bytes=encodeFastTelemetry(entries);bytes[3]|=0x80;assert.throws(()=>decodeFastTelemetry(bytes))
})
