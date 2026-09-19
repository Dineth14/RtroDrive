import { useMediaStore } from '@/state/mediaStore'
import type { MediaVisualStyle, VisualizerMode } from '@/types/media'
import { ToggleRow } from './MobileControls'
import './mobile.css'

const STYLES: { id: MediaVisualStyle; label: string; desc: string }[] = [
  { id: 'HERITAGE_RADIO', label: 'HERITAGE RADIO', desc: 'Ivory dial, chrome controls and twin VU instruments' },
  { id: 'CASSETTE_86', label: 'CASSETTE 86', desc: 'Auto-reverse deck with VFD block progress' },
  { id: 'GRAPHIC_EQ_91', label: 'GRAPHIC EQ 91', desc: 'Component head-unit spectrum analyzer' },
  { id: 'CD_94', label: 'CD 94', desc: 'Disc/track head-unit display' },
  { id: 'MINIDISC_98', label: 'MINIDISC 98', desc: 'Scrolling dot-matrix track display' },
]

const VIZ_MODES: { id: VisualizerMode; label: string }[] = [
  { id: 'SPECTRUM', label: 'SPECTRUM' },
  { id: 'VU_METER', label: 'VU METER' },
  { id: 'WAVE', label: 'WAVE' },
  { id: 'DOT_MATRIX', label: 'DOT MATRIX' },
]

export function MediaSettingsScreen() {
  const visualStyle = useMediaStore((s) => s.visualStyle)
  const setVisualStyle = useMediaStore((s) => s.setVisualStyle)
  const visualizerMode = useMediaStore((s) => s.visualizerMode)
  const setVisualizerMode = useMediaStore((s) => s.setVisualizerMode)
  const bluetoothConnected = useMediaStore((s) => s.bluetoothConnected)
  const setBluetoothConnected = useMediaStore((s) => s.setBluetoothConnected)

  return (
    <div>
      <div className="rd-m-card">
        <ToggleRow label="Bluetooth audio connected" on={bluetoothConnected} onChange={setBluetoothConnected} />
      </div>

      <div className="rd-m-section-label">CLUSTER MEDIA VISUAL STYLE</div>
      <div className="rd-m-card">
        {STYLES.map((s) => (
          <div className="rd-m-row clickable" key={s.id} onClick={() => setVisualStyle(s.id)}>
            <div>
              <div className="rd-m-row-label">{s.label}</div>
              <div style={{ fontSize: 11, color: '#6c786f', marginTop: 2 }}>{s.desc}</div>
            </div>
            {visualStyle === s.id && <span style={{ color: '#8fcb83', fontSize: 12 }}>ACTIVE</span>}
          </div>
        ))}
      </div>

      {visualStyle === 'GRAPHIC_EQ_91' && (
        <>
          <div className="rd-m-section-label">VISUALIZER MODE</div>
          <div className="rd-m-card">
            {VIZ_MODES.map((m) => (
              <div className="rd-m-row clickable" key={m.id} onClick={() => setVisualizerMode(m.id)}>
                <span className="rd-m-row-label">{m.label}</span>
                {visualizerMode === m.id && <span style={{ color: '#8fcb83', fontSize: 12 }}>ACTIVE</span>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
