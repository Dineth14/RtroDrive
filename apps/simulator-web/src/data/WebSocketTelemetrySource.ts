import { validateTelemetry, isNewerSequence } from '../../../../shared/telemetry.mjs'
import type { TelemetrySource } from './TelemetrySource'

export class WebSocketTelemetrySource implements TelemetrySource {
  readonly kind: 'websocket' | 'device-bridge' = 'websocket'
  private socket?: WebSocket
  private retry?: ReturnType<typeof setTimeout>
  private running = false
  constructor(private url: string) {
    const parsed = new URL(url)
    if (!['ws:', 'wss:'].includes(parsed.protocol)) throw new Error('WebSocket URL required')
    if (parsed.username || parsed.password) throw new Error('Credentials must not be in the URL')
  }
  start(onPacket: Parameters<TelemetrySource['start']>[0], onStatus: Parameters<TelemetrySource['start']>[1]) {
    this.stop(); this.running = true
    let failures = 0
    const connect = () => {
      if (!this.running) return
      onStatus('connecting')
      let session: string | undefined, sequence: number | undefined
      const socket = new WebSocket(this.url); this.socket = socket
      socket.onmessage = event => {
        if (!this.running || socket !== this.socket) return
        try {
          if (typeof event.data !== 'string' || event.data.length > 65536) throw new Error('Invalid message size')
          const packet = validateTelemetry(JSON.parse(event.data))
          if (session !== undefined && packet.sessionId !== session) throw new Error('Session changed without reconnect')
          if (sequence !== undefined && !isNewerSequence(packet.sequence, sequence)) return
          session = packet.sessionId; sequence = packet.sequence; failures = 0
          onPacket(packet); onStatus('receiving')
        } catch { onStatus('error'); socket.close(1008, 'Invalid telemetry') }
      }
      socket.onerror = () => { if (this.running) onStatus('error') }
      socket.onclose = () => {
        if (!this.running || socket !== this.socket) return
        onStatus('disconnected')
        this.retry = setTimeout(connect, Math.min(10000, 500 * 2 ** Math.min(failures++, 5)))
      }
    }
    connect()
  }
  stop() {
    this.running = false
    if (this.retry !== undefined) clearTimeout(this.retry)
    if (this.socket) { this.socket.onclose = null; this.socket.onmessage = null; this.socket.onerror = null; this.socket.close(); this.socket = undefined }
  }
}
