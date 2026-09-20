import spec from './ble-v1.json' with { type: 'json' }

const channels = new Map(spec.fastTelemetry.channels.map(c => [c.id, c]))
const sourceNames = Object.values(spec.sourceIds)
export function crc16(bytes) {
  let crc = 0xffff
  for (const byte of bytes) {
    crc ^= byte << 8
    for (let bit = 0; bit < 8; bit++) crc = ((crc << 1) ^ (crc & 0x8000 ? 0x1021 : 0)) & 0xffff
  }
  return crc
}
function integer(value, max) { if (!Number.isInteger(value) || value < 0 || value > max) throw new Error('Integer out of range'); return value }
export function encodeEnvelope({ messageId, sequence, sessionId, uptimeMs, flags = 0, payload = new Uint8Array() }) {
  if (!(payload instanceof Uint8Array) || payload.length > 4096 || flags & 0xf8) throw new Error('Invalid payload/flags')
  const bytes = new Uint8Array(18 + payload.length), view = new DataView(bytes.buffer)
  bytes[0] = 1; bytes[1] = integer(flags,255)
  view.setUint16(2, integer(messageId,65535), true); view.setUint16(4, payload.length, true)
  view.setUint16(6, integer(sequence,65535), true); view.setUint32(8, integer(sessionId,0xffffffff), true)
  view.setUint32(12, integer(uptimeMs,0xffffffff), true); bytes.set(payload,16)
  view.setUint16(bytes.length-2,crc16(bytes.subarray(0,-2)),true)
  return bytes
}
export function decodeEnvelope(bytes, expectedSession) {
  if (!(bytes instanceof Uint8Array) || bytes.length < 18 || bytes.length > 4114) throw new Error('Invalid envelope size')
  const view = new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength)
  if (bytes[0] !== 1 || bytes[1] & 0xf8 || view.getUint16(4,true) !== bytes.length-18) throw new Error('Invalid version/flags/length')
  if (view.getUint16(bytes.length-2,true) !== crc16(bytes.subarray(0,-2))) throw new Error('CRC mismatch')
  const sessionId = view.getUint32(8,true)
  if (expectedSession !== undefined && sessionId !== expectedSession) throw new Error('Old session')
  return { messageId:view.getUint16(2,true), sequence:view.getUint16(6,true), sessionId, uptimeMs:view.getUint32(12,true), flags:bytes[1], payload:bytes.slice(16,-2) }
}
export function encodeFastTelemetry(entries) {
  if (entries.length > 32) throw new Error('Too many channels')
  const bytes = new Uint8Array(2 + 8*entries.length), view = new DataView(bytes.buffer), seen = new Set()
  bytes[0] = entries.length
  entries.forEach((entry,index) => {
    const c = channels.get(entry.id), source = sourceNames.indexOf(entry.source), pos=2+index*8
    if (!c || seen.has(entry.id) || source < 0 || typeof entry.valid !== 'boolean') throw new Error('Invalid channel metadata')
    seen.add(entry.id)
    if (entry.valid ? !Number.isFinite(entry.value) || entry.value < c.min || entry.value > c.max : entry.value !== null) throw new Error('Invalid channel value')
    integer(entry.ageMs,Number.MAX_SAFE_INTEGER)
    bytes[pos] = entry.id; bytes[pos+1] = (source<<1) | Number(entry.valid)
    view.setUint16(pos+2,Math.min(65535,entry.ageMs),true)
    view.setInt32(pos+4,entry.valid?Math.round(entry.value/c.scale):0,true)
  })
  return bytes
}
export function decodeFastTelemetry(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length < 2 || bytes[0] > 32 || bytes[1] !== 0 || bytes.length !== 2 + bytes[0]*8) throw new Error('Invalid telemetry size')
  const view = new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength), result={}, seen=new Set()
  for (let pos=2;pos<bytes.length;pos+=8) {
    const c=channels.get(bytes[pos]), quality=bytes[pos+1], source=sourceNames[(quality>>1)&7], raw=view.getInt32(pos+4,true), valid=Boolean(quality&1)
    if (!c || seen.has(c.id) || quality&0xf0 || !source || (!valid && raw!==0)) throw new Error('Invalid telemetry entry')
    seen.add(c.id)
    const value=valid?raw*c.scale:null
    if (valid && (value<c.min || value>c.max)) throw new Error('Telemetry out of range')
    result[c.name]={value,valid,source,ageMs:view.getUint16(pos+2,true),unit:c.unit}
  }
  return result
}
export function fragment(bytes, valueCapacity=20, transferId=1) {
  integer(transferId,255)
  if (!(bytes instanceof Uint8Array) || bytes.length<18 || bytes.length>4114 || !Number.isInteger(valueCapacity) || valueCapacity<20 || valueCapacity>512) throw new Error('Fragment bounds')
  const result=[]
  for(let offset=0;offset<bytes.length;offset+=valueCapacity-6) {
    const chunk=bytes.slice(offset,offset+valueCapacity-6), value=new Uint8Array(6+chunk.length), view=new DataView(value.buffer)
    value[0]=0xf1;value[1]=transferId;view.setUint16(2,offset,true);view.setUint16(4,bytes.length,true);value.set(chunk,6);result.push(value)
  }
  return result
}
/** One instance per authenticated connection. Discard instance on reconnect. */
export class Reassembler {
  transfers = new Map()
  clear() { this.transfers.clear() }
  feed(fragmentBytes, nowMs) {
    for(const [key,t] of this.transfers) if(nowMs-t.last>=2000) this.transfers.delete(key)
    if (!(fragmentBytes instanceof Uint8Array) || fragmentBytes.length<7 || fragmentBytes.length>512 || fragmentBytes[0]!==0xf1) throw new Error('Invalid fragment')
    const view=new DataView(fragmentBytes.buffer,fragmentBytes.byteOffset,fragmentBytes.byteLength), key=fragmentBytes[1], offset=view.getUint16(2,true), total=view.getUint16(4,true), chunk=fragmentBytes.subarray(6)
    if(total<18 || total>4114 || offset+chunk.length>total) throw new Error('Fragment out of bounds')
    let t=this.transfers.get(key)
    if(!t) {
      if(this.transfers.size>=2) throw new Error('Too many transfers')
      t={bytes:new Uint8Array(total),present:new Uint8Array(total),count:0,last:nowMs};this.transfers.set(key,t)
    }
    if(t.bytes.length!==total) {this.transfers.delete(key);throw new Error('Inconsistent transfer length')}
    for(let i=0;i<chunk.length;i++) if(t.present[offset+i] && t.bytes[offset+i]!==chunk[i]) {this.transfers.delete(key);throw new Error('Conflicting overlap')}
    for(let i=0;i<chunk.length;i++) {if(!t.present[offset+i]) t.count++;t.present[offset+i]=1;t.bytes[offset+i]=chunk[i]}
    t.last=nowMs
    if(t.count===total) {this.transfers.delete(key);return t.bytes}
    return null
  }
}
