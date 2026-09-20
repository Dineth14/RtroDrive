import { WebSocketTelemetrySource } from './WebSocketTelemetrySource'

/** Local bridge transport; does not itself claim connected vehicle hardware. */
export class DeviceBridgeTelemetrySource extends WebSocketTelemetrySource {
  readonly kind = 'device-bridge' as const
  constructor(url = 'ws://127.0.0.1:8765/telemetry') { super(url) }
}
