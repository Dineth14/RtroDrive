import { useMediaStore } from '@/state/mediaStore'
import type { MediaVisualStyle } from '@/types/media'
import { ToggleRow } from './MobileControls'
import './mobile.css'

const STYLES: { id: MediaVisualStyle; label: string; desc: string }[] = [
  { id: 'CASSETTE_86', label: 'CASSETTE 86', desc: 'Spinning reel head-unit display' },
  { id: 'CD_92', label: 'CD 92', desc: 'Spinning disc head-unit display' },
  { id: 'MINIDISC_97', label: 'MINIDISC 97', desc: 'Dashed-disc head-unit display' },
]

export function MediaSettingsScreen() {
  const visualStyle = useMediaStore((s) => s.visualStyle)
  const setVisualStyle = useMediaStore((s) => s.setVisualStyle)
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
    </div>
  )
}
