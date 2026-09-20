import { createServer } from 'node:http'
import { createHash, randomBytes } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { simulatedPacket, SCENARIOS } from '../vehicle-simulator/simulator.mjs'

function textFrame(value) {
  const payload = Buffer.from(JSON.stringify(value))
  const header = payload.length < 126 ? Buffer.from([0x81, payload.length]) : Buffer.from([0x81, 126, payload.length >> 8, payload.length & 255])
  return Buffer.concat([header, payload])
}

/** Receive-only development stream; no vehicle commands, uploads, or network-wide binding. */
export function startBridge({ port = 8765, scenario = 'cruise' } = {}) {
  if (!SCENARIOS.includes(scenario)) throw new Error('Unknown scenario')
  const peers = new Map()
  const server = createServer((req, res) => {
    if (req.url !== '/health') { res.writeHead(404); res.end(); return }
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
    res.end(JSON.stringify({ mode: 'simulated', scenario, vehicleHardware: false }))
  })
  server.on('upgrade', (req, socket) => {
    const key = req.headers['sec-websocket-key'], origin = req.headers.origin
    const allowed = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173', 'http://127.0.0.1:4173']
    if (req.url !== '/telemetry' || !origin || !allowed.includes(origin) || typeof key !== 'string' || !/^[A-Za-z0-9+/]{22}==$/.test(key) || req.headers['sec-websocket-version'] !== '13' || req.headers.upgrade?.toLowerCase() !== 'websocket' || peers.size >= 8) {
      socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'); return
    }
    const accept = createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64')
    socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`)
    peers.set(socket, { sequence: 0, session: randomBytes(12).toString('hex') })
    socket.on('error', () => { peers.delete(socket); socket.destroy() })
    socket.on('close', () => peers.delete(socket))
    // Application writes are forbidden. Closing on any inbound frame also handles client close.
    socket.on('data', () => { peers.delete(socket); socket.destroy() })
  })
  const timer = setInterval(() => {
    for (const [socket, state] of peers) {
      if (socket.writableLength > 65536) { socket.destroy(); peers.delete(socket); continue }
      socket.write(textFrame(simulatedPacket(state.sequence++, scenario, state.session)))
    }
  }, 100)
  const close = async () => { clearInterval(timer); for (const socket of peers.keys()) socket.destroy(); await new Promise(resolve => server.close(resolve)) }
  server.listen(port, '127.0.0.1')
  return { server, close }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const scenario = process.argv[2] ?? 'cruise'
  const bridge = startBridge({ scenario })
  console.log(`RetroDrive simulated bridge: ws://127.0.0.1:8765/telemetry (${scenario})`)
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => void bridge.close())
}
