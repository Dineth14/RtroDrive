import { useMediaStore } from '@/state/mediaStore'
import type { MediaVisualStyle, VisualizerMode } from '@/types/media'
import { ToggleRow } from './MobileControls'
import './mobile.css'

const STYLES: { id: MediaVisualStyle; label: string; desc: string }[] = [
  { id: 'HERITAGE_RADIO', label: 'HERITAGE RADIO', desc: 'Ivory dial, chrome controls and twin VU instruments' },
  { id: 'CASSETTE_86', label: 'CASSETTE 86', desc: 'Auto-reverse deck with VFD block progress' },
  { id: 'EQ_DECK_89', label: 'EQ DECK 89', desc: 'Dense graphic-equalizer dominant head unit' },
  { id: 'DSP_RECEIVER_92', label: 'DSP RECEIVER 92', desc: 'Illuminated component receiver, teal/green displays' },
  { id: 'CD_TUNER_95', label: 'CD TUNER 95', desc: 'Disc/track head-unit display' },
  { id: 'MD_DOT_MATRIX_98', label: 'MD DOT MATRIX 98', desc: 'Scrolling dot-matrix track display' },
  { id: 'EXPEDITION_RECEIVER', label: 'EXPEDITION RECEIVER', desc: 'Rugged receiver with signal/battery/GPS status' },
]

const VIZ_MODES: { id: VisualizerMode; label: string }[] = [
  { id: 'SPECTRUM', label: 'SPECTRUM' },
  { id: 'PEAK_HOLD', label: 'PEAK HOLD' },
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

      {visualStyle === 'EQ_DECK_89' && (
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
