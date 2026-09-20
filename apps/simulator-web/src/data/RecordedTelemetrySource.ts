import { validateTelemetry, isNewerSequence, type TelemetryPacket } from '../../../../shared/telemetry.mjs'
import type { TelemetrySource } from './TelemetrySource'

export function parseRecording(text: string): TelemetryPacket[] {
  if (text.length > 8 * 1024 * 1024) throw new Error('Recording exceeds 8 MiB')
  const records = text.split(/\r?\n/).filter(line => line.trim()).map(line => validateTelemetry(JSON.parse(line)))
  if (!records.length || records.length > 10000) throw new Error('Recording requires 1–10000 snapshots')
  for (let i = 1; i < records.length; i++) {
    const prev = records[i - 1], next = records[i]
    if (next.sessionId !== prev.sessionId || next.timestampMs < prev.timestampMs || !isNewerSequence(next.sequence, prev.sequence)) throw new Error('Recording must be ordered within one session')
  }
  return records
}

export class RecordedTelemetrySource implements TelemetrySource {
  readonly kind = 'recorded' as const
  private timer?: ReturnType<typeof setTimeout>
  private running = false
  constructor(private records: TelemetryPacket[]) {}
  start(onPacket: Parameters<TelemetrySource['start']>[0], onStatus: Parameters<TelemetrySource['start']>[1]) {
    this.stop(); this.running = true
    const start = performance.now(), origin = this.records[0]?.timestampMs
    if (origin === undefined) { onStatus('error'); return }
    onStatus('receiving')
    let index = 0
    const tick = () => {
      if (!this.running) return
      const elapsed = performance.now() - start
      while (index < this.records.length && this.records[index].timestampMs - origin <= elapsed) onPacket(this.records[index++])
      if (index === this.records.length) { onStatus('complete'); return }
      this.timer = setTimeout(tick, Math.min(100, this.records[index].timestampMs - origin - elapsed))
    }
    tick()
  }
  stop() { this.running = false; if (this.timer !== undefined) clearTimeout(this.timer) }
}
