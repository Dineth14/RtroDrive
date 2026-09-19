import { useEffect, useRef, useState } from 'react'
import { useVehicleStore } from '@/state/vehicleStore'
import { SevenSegmentGroup } from './widgets/SevenSegment'
import { WarningLampStrip } from './widgets/WarningLampStrip'
import { RpmBar } from './widgets/RpmBar'
import './BootSequence.css'

function connState(v: string): 'OK' | 'PENDING' | 'FAULT' {
  if (v === 'CONNECTED' || v === 'FIX') return 'OK'
  if (v === 'FAULT' || v === 'LOST' || v === 'UNAVAILABLE') return 'FAULT'
  return 'PENDING'
}

function StatusLine({ label, state }: { label: string; state: 'OK' | 'PENDING' | 'FAULT' }) {
  const text = state === 'OK' ? 'OK' : state === 'FAULT' ? 'FAULT' : label === 'GPS' ? 'SEARCH' : 'CONNECTING'
  const color =
    state === 'OK' ? 'var(--cl-primary-bright)' : state === 'FAULT' ? 'var(--cl-critical-red)' : 'var(--cl-warning-amber)'
  return (
    <div className="rd-boot-status-line">
      <span>{label}</span>
      <span className="rd-boot-status-dots">........</span>
      <span style={{ color }}>{text}</span>
    </div>
  )
}

export function BootSequence() {
  const bootPhase = useVehicleStore((s) => s.bootPhase)
  const connections = useVehicleStore((s) => s.connections)
  const [sweepRpm, setSweepRpm] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (bootPhase !== 'RPM_SWEEP') return
    const start = performance.now()
    const duration = 700
    const animate = (now: number) => {
      const t = (now - start) / duration
      if (t >= 1) {
        setSweepRpm(0)
        return
      }
      const value = t < 0.5 ? t * 2 * 7800 : (1 - t) * 2 * 7800
      setSweepRpm(value)
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [bootPhase])

  return (
    <div className="rd-boot">
      {bootPhase === 'BLACK' && null}

      {bootPhase === 'SEGMENT_TEST' && (
        <>
          <div className="rd-boot-logo">RETRODRIVE</div>
          <div className="rd-boot-segrow">
            <div className="rd-boot-segblock">
              <SevenSegmentGroup text="888" litColor="var(--cl-primary-bright)" heightPx={56} />
              <span className="rd-boot-segblock-label">RPM x100</span>
            </div>
            <div className="rd-boot-segblock">
              <SevenSegmentGroup text="88.8" litColor="var(--cl-amber)" heightPx={56} />
              <span className="rd-boot-segblock-label">VOLTS</span>
            </div>
            <div className="rd-boot-segblock">
              <SevenSegmentGroup text="188" litColor="var(--cl-critical-red)" heightPx={56} />
              <span className="rd-boot-segblock-label">DEG C</span>
            </div>
          </div>
        </>
      )}

      {bootPhase === 'LAMP_TEST' && (
        <>
          <div className="rd-boot-sub">SYSTEM CHECK</div>
          <div className="rd-boot-lamprow">
            <WarningLampStrip forceAllLit />
          </div>
        </>
      )}

      {bootPhase === 'RPM_SWEEP' && (
        <div style={{ width: 640 }}>
          <RpmBar rpm={sweepRpm} redlineRpm={7500} />
        </div>
      )}

      {bootPhase === 'STATUS_INIT' && (
        <div className="rd-boot-status">
          <StatusLine label="OBD" state={connState(connections.obd)} />
          <StatusLine label="GPS" state={connState(connections.gps)} />
          <StatusLine label="PHONE" state={connState(connections.phone)} />
        </div>
      )}

      {bootPhase === 'SYSTEM_OK' && <div className="rd-boot-systemok">SYSTEM OK</div>}
    </div>
  )
}
