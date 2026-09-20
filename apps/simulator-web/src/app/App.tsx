import { useEffect, useRef, useState } from 'react'
import { ClusterShell } from '@/cluster/ClusterShell'
import { PhoneShell } from '@/mobile/PhoneShell'
import { DeveloperPanel } from '@/simulator/DeveloperPanel'
import { useVehicleStore } from '@/state/vehicleStore'
import { useSettingsStore } from '@/state/settingsStore'
import { setOverride } from '@/simulator/telemetryEngine'
import { useTelemetrySource } from '@/data/useTelemetrySource'
import { MockTelemetrySource } from '@/data/MockTelemetrySource'
import { DeviceBridgeTelemetrySource } from '@/data/DeviceBridgeTelemetrySource'
import { RecordedTelemetrySource, parseRecording } from '@/data/RecordedTelemetrySource'
import { SourceLivePanel } from '@/data/SourceLivePanel'
import { triggerBootSequence } from '@/simulator/bootController'
import { createDtc } from '@/simulator/diagnosticEngine'
import { configureAudio, unlockAudio, warningChime, criticalAlarm } from '@/audio/sounds'
import { CLUSTER_WIDTH, CLUSTER_HEIGHT } from '@/theme/tokens'
import type { ClusterScreenId } from '@/state/vehicleStore'
import './App.css'

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v))
}

export function App() {
  const live = useTelemetrySource()
  const isMock = live.source.kind === 'mock'
  const [sourceError, setSourceError] = useState('')
  const soundSettings=useSettingsStore(s=>s.sound)
  useEffect(()=>configureAudio({masterVolume:soundSettings.masterVolume/100,warningVolume:soundSettings.warningVolume/100,soundEnabled:soundSettings.soundEnabled}),[soundSettings])
  const [showDev, setShowDev] = useState(true)
  const [showPhone, setShowPhone] = useState(true)
  const [scale, setScale] = useState(0.7)
  const clusterAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sound = useSettingsStore.getState().sound
    configureAudio({
      masterVolume: sound.masterVolume / 100,
      warningVolume: sound.warningVolume / 100,
      soundEnabled: sound.soundEnabled,
    })
    const unlockOnce = () => {
      unlockAudio()
      window.removeEventListener('pointerdown', unlockOnce)
    }
    window.addEventListener('pointerdown', unlockOnce)
    return () => {
      window.removeEventListener('pointerdown', unlockOnce)
    }
  }, [])

  useEffect(() => {
    const el = clusterAreaRef.current
    if (!el) return
    const compute = () => {
      const sideWidth=(showPhone?414:0)+(showDev?364:0)
      const availW = window.innerWidth>1100 ? window.innerWidth-sideWidth-130 : window.innerWidth-100
      const availH = window.innerHeight - 140
      const s = clamp(Math.min(availW / CLUSTER_WIDTH, availH / CLUSTER_HEIGHT), 0.25, 1.3)
      setScale(s)
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [showPhone, showDev])

  useEffect(() => {
    if (!isMock) return
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return

      const store = useVehicleStore.getState()
      const t = store.telemetry
      const goto = (screen: ClusterScreenId) => store.setActiveClusterScreen(screen)

      switch (e.key) {
        case ' ':
          e.preventDefault()
          if (store.engine === 'RUNNING') {
            store.setEngine('OFF')
          } else {
            if (store.ignition === 'OFF') {
              store.setIgnition('ON')
              triggerBootSequence()
            } else {
              store.setEngine('RUNNING')
            }
          }
          break
        case 'b':
        case 'B':
          triggerBootSequence()
          break
        case 'w':
        case 'W':
          store.pushWarning({
            id: `manual-${Date.now()}`,
            severity: 'WARNING',
            title: 'TEST WARNING',
            detail: 'Manually injected via keyboard shortcut',
            acknowledged: false,
            createdAt: Date.now(),
            source: 'manual',
          })
          if (useSettingsStore.getState().sound.soundEnabled) warningChime()
          break
        case 'c':
        case 'C':
          store.pushWarning({
            id: `manual-critical-${Date.now()}`,
            severity: 'CRITICAL',
            title: 'CRITICAL TEST ALERT',
            detail: 'Manually injected via keyboard shortcut',
            acknowledged: false,
            createdAt: Date.now(),
            source: 'manual',
          })
          if (useSettingsStore.getState().sound.soundEnabled) criticalAlarm()
          break
        case 'd':
        case 'D':
          store.addOrUpdateDtc(
            createDtc(
              'P0171',
              t,
              [
                { label: 'Short fuel trim (STFT)', value: '+18%' },
                { label: 'Long fuel trim (LTFT)', value: '+14%' },
              ],
              'WARNING',
              'MODERATE'
            )
          )
          break
        case 'm':
        case 'M':
          goto('MEDIA')
          break
        case 'h':
        case 'H':
          goto('HEALTH')
          break
        case 'g':
        case 'G':
          goto('GPS')
          break
        case '1':
          goto('DASHBOARD')
          break
        case '2':
          goto('PERFORMANCE')
          break
        case '3':
          goto('GPS')
          break
        case '4':
          goto('HEALTH')
          break
        case '5':
          goto('DIAGNOSTICS')
          break
        case '6':
          goto('MEDIA')
          break
        case '7':
          goto('TRIP')
          break
        case '8':
        case 't':
        case 'T':
          goto('TERRAIN')
          break
        case 'ArrowUp':
          e.preventDefault()
          if (e.shiftKey) setOverride('rpm', clamp(t.rpm.value + 250, 0, 8000))
          else setOverride('speedKph', clamp(t.speedKph.value + 5, 0, 220))
          break
        case 'ArrowDown':
          e.preventDefault()
          if (e.shiftKey) setOverride('rpm', clamp(t.rpm.value - 250, 0, 8000))
          else setOverride('speedKph', clamp(t.speedKph.value - 5, 0, 220))
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isMock])

  return (
    <div className="rd-app">
      <div className="rd-app-topbar">
        <span className="rd-app-topbar-brand">RETRODRIVE HMI SIMULATOR</span>
        <div className="rd-app-topbar-actions">
          <select aria-label="Telemetry source" value={live.source.kind} onChange={e => { setSourceError(''); live.setSource(e.target.value === 'mock' ? new MockTelemetrySource() : new DeviceBridgeTelemetrySource()) }}>
            <option value="mock">MOCK VEHICLE</option><option value="device-bridge">LOCAL BRIDGE</option>{live.source.kind === 'recorded' && <option value="recorded">RECORDING</option>}
          </select>
          <input className="rd-source-file" type="file" accept=".jsonl,.ndjson" aria-label="Replay telemetry recording" onChange={async e => {
            const file = e.target.files?.[0]; if (!file) return
            try { if (file.size > 8 * 1024 * 1024) throw new Error('Recording exceeds 8 MiB'); live.setSource(new RecordedTelemetrySource(parseRecording(await file.text()))); setSourceError('') }
            catch (error) { setSourceError(error instanceof Error ? error.message : 'Invalid recording') }
            e.target.value = ''
          }} />
          {sourceError && <span role="alert">{sourceError}</span>}
          <span>1024&times;600 @ {Math.round(scale * 100)}%</span>
          <button className="rd-app-topbar-btn" onClick={() => setShowPhone((v) => !v)}>
            {showPhone ? 'HIDE PHONE' : 'SHOW PHONE'}
          </button>
          <button className="rd-app-topbar-btn" onClick={() => setShowDev((v) => !v)}>
            {showDev ? 'HIDE DEV PANEL' : 'SHOW DEV PANEL'}
          </button>
        </div>
      </div>

      <div className="rd-app-body">
        <div className="rd-cluster-area" ref={clusterAreaRef}>
          <div className="rd-bezel">
            <div className="rd-bezel-screw tl" />
            <div className="rd-bezel-screw tr" />
            <div className="rd-bezel-screw bl" />
            <div className="rd-bezel-screw br" />
            <div
              className="rd-bezel-screen-mask"
              style={{ width: CLUSTER_WIDTH * scale, height: CLUSTER_HEIGHT * scale }}
            >
              <div style={{ width: CLUSTER_WIDTH, height: CLUSTER_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                {isMock ? <ClusterShell /> : <SourceLivePanel packet={live.packet} status={live.status} receivedAt={live.receivedAt} />}
              </div>
            </div>
            <div className="rd-bezel-label">RETRODRIVE · AUX INSTRUMENT CLUSTER</div>
          </div>
        </div>

        {(showPhone || showDev) && (
          <div className="rd-panels-row">
            {showPhone && (isMock ? <PhoneShell /> : <SourceLivePanel compact packet={live.packet} status={live.status} receivedAt={live.receivedAt} />)}
            {showDev && isMock && (
              <div className="rd-dev-panel-wrap">
                <DeveloperPanel />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
