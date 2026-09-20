import test from 'node:test'
import assert from 'node:assert/strict'
import net from 'node:net'
import { once } from 'node:events'
import { startBridge } from '../../tools/telemetry-bridge/server.mjs'
import { validateTelemetry } from '../../shared/telemetry.mjs'

test('bridge serves simulated contract and rejects untrusted origins', async () => {
  const bridge = startBridge({ port: 0 })
  await once(bridge.server, 'listening')
  const port = bridge.server.address().port
  try {
    assert.equal((await (await fetch(`http://127.0.0.1:${port}/health`)).json()).vehicleHardware, false)
    for (const [origin, accepted] of [['http://localhost:5173', true], ['https://example.com', false]]) {
      const socket = net.connect(port, '127.0.0.1'); await once(socket, 'connect')
      const data = new Promise((resolve, reject) => {
        let buffer = Buffer.alloc(0)
        const timer = setTimeout(() => { socket.destroy(); reject(new Error('Bridge response timed out')) }, 2000)
        socket.on('error', reject)
        socket.on('data', chunk => {
          buffer = Buffer.concat([buffer, chunk]); const boundary = buffer.indexOf('\r\n\r\n')
          if (boundary < 0) return
          if (!accepted) { clearTimeout(timer); resolve(buffer); return }
          const frame = buffer.subarray(boundary + 4); if (frame.length < 4) return
          const length = frame[1] === 126 ? frame.readUInt16BE(2) : frame[1]; const offset = frame[1] === 126 ? 4 : 2
          if (frame.length >= offset + length) { clearTimeout(timer); resolve(frame.subarray(offset, offset + length)) }
        })
      })
      socket.write(`GET /telemetry HTTP/1.1\r\nHost: localhost\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nOrigin: ${origin}\r\n\r\n`)
      const response = await data
      if (accepted) assert.equal(validateTelemetry(JSON.parse(response)).channels.rpm.source, 'simulated')
      else assert.match(response.toString(), /403 Forbidden/)
      socket.destroy()
    }
  } finally { await bridge.close() }
})
