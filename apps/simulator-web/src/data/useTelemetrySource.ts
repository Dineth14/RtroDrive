import { useEffect, useState } from 'react'
import type { TelemetryPacket } from '../../../../shared/telemetry.mjs'
import { MockTelemetrySource } from './MockTelemetrySource'
import type { SourceStatus, TelemetrySource } from './TelemetrySource'

export function useTelemetrySource() {
  const [source, setSource] = useState<TelemetrySource>(() => new MockTelemetrySource())
  const [packet, setPacket] = useState<TelemetryPacket | null>(null)
  const [status, setStatus] = useState<SourceStatus>('connecting')
  const [receivedAt, setReceivedAt] = useState(0)
  useEffect(() => {
    let active = true
    setPacket(null); setStatus('connecting')
    source.start(next => {
      if (active) { setPacket(next); setReceivedAt(performance.now()) }
    }, next => {
      if (!active) return
      setStatus(next)
      if (['connecting', 'disconnected', 'error'].includes(next)) setPacket(null)
    })
    return () => { active = false; source.stop() }
  }, [source])
  return { source, setSource, packet, status, receivedAt }
}
