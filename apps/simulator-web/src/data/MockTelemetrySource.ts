import { startTelemetryEngine, stopTelemetryEngine } from '@/simulator/telemetryEngine'
import { cancelBootSequence } from '@/simulator/bootController'
import type { TelemetrySource } from './TelemetrySource'

/** Existing simulation is intentionally retained; it alone owns prototype stores. */
export class MockTelemetrySource implements TelemetrySource {
  readonly kind = 'mock' as const
  start(_packet: Parameters<TelemetrySource['start']>[0], status: Parameters<TelemetrySource['start']>[1]) {
    startTelemetryEngine()
    status('receiving')
  }
  stop() { stopTelemetryEngine(); cancelBootSequence() }
}
