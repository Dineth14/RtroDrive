import type { TelemetryPacket } from '../../../../shared/telemetry.mjs'

export type SourceStatus = 'connecting' | 'receiving' | 'disconnected' | 'complete' | 'error'
export interface TelemetrySource {
  readonly kind: 'mock' | 'recorded' | 'websocket' | 'device-bridge'
  start(onPacket: (packet: TelemetryPacket) => void, onStatus: (status: SourceStatus) => void): void
  stop(): void
}
