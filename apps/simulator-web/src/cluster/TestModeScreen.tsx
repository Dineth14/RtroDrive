import { useState } from 'react'
import { SevenSegmentGroup } from './widgets/SevenSegment'
import { RpmBar } from './widgets/RpmBar'
import { SignalIndicator } from './widgets/SignalIndicator'
import { startupChime, warningChime, criticalAlarm, speedChime, connectionTone } from '@/audio/sounds'
import './TestModeScreen.css'

export function TestModeScreen() {
  const [sweep, setSweep] = useState(0)

  return (
    <div className="rd-screen">
      <div className="rd-test">
        <div className="rd-section-title" style={{ marginTop: 8 }}>
          DISPLAY TEST
        </div>

        <div className="rd-test-row">
          <SevenSegmentGroup text="8888" litColor="var(--cl-primary-bright)" heightPx={48} />
          <SevenSegmentGroup text="8888" litColor="var(--cl-amber)" heightPx={48} />
          <SevenSegmentGroup text="8888" litColor="var(--cl-critical-red)" heightPx={48} />
        </div>

        <div className="rd-test-row rd-test-swatches">
          <div className="rd-test-swatch" style={{ background: 'var(--cl-primary)', color: 'var(--cl-background)' }}>PRIMARY</div>
          <div className="rd-test-swatch" style={{ background: 'var(--cl-amber)', color: 'var(--cl-background)' }}>AMBER</div>
          <div className="rd-test-swatch" style={{ background: 'var(--cl-warning-amber)', color: 'var(--cl-background)' }}>WARN</div>
          <div className="rd-test-swatch" style={{ background: 'var(--cl-critical-red)', color: 'var(--cl-background)' }}>CRIT</div>
          <div className="rd-test-swatch" style={{ background: 'var(--cl-muted-text)', color: 'var(--cl-background)' }}>MUTED</div>
        </div>

        <div style={{ width: 600 }}>
          <RpmBar rpm={sweep} redlineRpm={7500} />
        </div>
        <button className="rd-test-btn" onClick={() => setSweep((v) => (v >= 7800 ? 0 : v + 1300))}>
          STEP GAUGE SWEEP
        </button>

        <div className="rd-test-row">
          <SignalIndicator label="GPS" state="OK" detail="FIX" />
          <SignalIndicator label="OBD" state="OK" detail="CONNECTED" />
          <SignalIndicator label="PHONE" state="PENDING" detail="SEARCH" />
        </div>

        <div className="rd-test-row">
          <button className="rd-test-btn" onClick={() => startupChime()}>STARTUP CHIME</button>
          <button className="rd-test-btn" onClick={() => warningChime()}>WARNING CHIME</button>
          <button className="rd-test-btn" onClick={() => criticalAlarm()}>CRITICAL ALARM</button>
          <button className="rd-test-btn" onClick={() => speedChime()}>SPEED CHIME</button>
          <button className="rd-test-btn" onClick={() => connectionTone()}>CONNECTION TONE</button>
        </div>
      </div>
    </div>
  )
}
