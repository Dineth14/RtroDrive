import { startTelemetryEngine, stopTelemetryEngine } from '@/simulator/telemetryEngine'
import { cancelBootSequence } from '@/simulator/bootController'
import { useVehicleStore } from '@/state/vehicleStore'
import { sample, validateTelemetry } from '../../../../shared/telemetry.mjs'
import type { TelemetrySource } from './TelemetrySource'

/** Existing simulation is intentionally retained; it alone owns prototype stores. */
export class MockTelemetrySource implements TelemetrySource {
  readonly kind = 'mock' as const
  private unsubscribe?: () => void
  start(onPacket: Parameters<TelemetrySource['start']>[0], status: Parameters<TelemetrySource['start']>[1]) {
    this.stop()
    const origin = performance.now(); let sequence = 0
    this.unsubscribe = useVehicleStore.subscribe((state, previous) => {
      if (state.telemetry === previous.telemetry) return
      const t = state.telemetry
      const mapping = {rpm:t.rpm, speedKph:t.speedKph, coolantC:t.coolantTempC, intakeAirC:t.intakeTempC, throttlePct:t.throttlePercent, engineLoadPct:t.engineLoadPercent, batteryVoltage:t.batteryVoltage, mapKpa:t.mapAbsoluteKpa, mafGps:t.mafGps, fuelLevelPct:t.fuelPercent}
      onPacket(validateTelemetry({schemaVersion:1,type:'telemetry',sessionId:'browser-mock',sequence:sequence++,timestampMs:Math.round(performance.now()-origin),connectionState:state.connections.obd==='CONNECTED'?'connected':'disconnected',vehicleProfile:'generic_can',ignition:state.ignition.toLowerCase(),engineRunning:state.engine!=='OFF',channels:Object.fromEntries(Object.entries(mapping).map(([name,c])=>[name,sample(name,c.available?c.value:null)]))}))
    })
    startTelemetryEngine()
    status('receiving')
  }
  stop() { this.unsubscribe?.(); this.unsubscribe = undefined; stopTelemetryEngine(); cancelBootSequence() }
}
