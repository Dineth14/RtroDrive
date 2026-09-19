import { useSettingsStore } from '@/state/settingsStore'
import type { ClusterLayoutId, PrimaryColorName, ThemeName } from '@/types/vehicle'
import { CLUSTER_LAYOUT_LABELS } from '@/cluster/layouts/registry'
import { SliderRow, ToggleRow } from './MobileControls'
import './mobile.css'

const THEMES: { id: ThemeName; label: string }[] = [
  { id: 'JDM_PHOSPHOR', label: 'JDM PHOSPHOR' },
  { id: 'JDM_AMBER', label: 'JDM AMBER' },
  { id: 'EURO_GREEN', label: 'EURO GREEN' },
  { id: 'MONO_LCD', label: 'MONO LCD' },
]

const LAYOUTS: ClusterLayoutId[] = ['JDM_DIGITAL_86', 'EURO_DIGITAL_89', 'JDM_GT_93', 'TOURING_96', 'CLASSIC_ELECTRONIC']

const PRIMARY_COLORS: { id: PrimaryColorName; label: string; theme: ThemeName; swatch: string }[] = [
  { id: 'PHOSPHOR_GREEN', label: 'PHOSPHOR GREEN', theme: 'JDM_PHOSPHOR', swatch: '#8fcb83' },
  { id: 'AMBER', label: 'AMBER', theme: 'JDM_AMBER', swatch: '#d7a94a' },
  { id: 'ICE_GREEN', label: 'ICE GREEN', theme: 'EURO_GREEN', swatch: '#7fc7c9' },
]

export function DisplaySettingsScreen() {
  const display = useSettingsStore((s) => s.display)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const updateDisplay = useSettingsStore((s) => s.updateDisplay)

  return (
    <div>
      <div className="rd-m-section-label">CLUSTER LAYOUT</div>
      <div className="rd-m-card">
        {LAYOUTS.map((id) => (
          <div className="rd-m-row clickable" key={id} onClick={() => updateDisplay({ clusterLayout: id })}>
            <span className="rd-m-row-label">{CLUSTER_LAYOUT_LABELS[id]}</span>
            {display.clusterLayout === id && <span style={{ color: '#8fcb83', fontSize: 12 }}>ACTIVE</span>}
          </div>
        ))}
      </div>

      <div className="rd-m-section-label">PRIMARY COLOR</div>
      <div className="rd-m-card">
        {PRIMARY_COLORS.map((c) => (
          <div
            className="rd-m-row clickable"
            key={c.id}
            onClick={() => {
              updateDisplay({ primaryColor: c.id })
              setTheme(c.theme)
            }}
          >
            <span className="rd-m-row-label" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: c.swatch, display: 'inline-block' }} />
              {c.label}
            </span>
            {display.primaryColor === c.id && <span style={{ color: '#8fcb83', fontSize: 12 }}>ACTIVE</span>}
          </div>
        ))}
      </div>

      <div className="rd-m-section-label">THEME (ADVANCED)</div>
      <div className="rd-m-card">
        {THEMES.map((t) => (
          <div className="rd-m-row clickable" key={t.id} onClick={() => setTheme(t.id)}>
            <span className="rd-m-row-label">{t.label}</span>
            {display.theme === t.id && <span style={{ color: '#8fcb83', fontSize: 12 }}>ACTIVE</span>}
          </div>
        ))}
      </div>

      <div className="rd-m-card">
        <SliderRow
          label="Brightness"
          value={display.brightness}
          min={20}
          max={100}
          unit="%"
          onChange={(v) => updateDisplay({ brightness: v })}
        />
        <ToggleRow label="Automatic brightness" on={display.autoBrightness} onChange={(v) => updateDisplay({ autoBrightness: v })} />
        {display.autoBrightness && (
          <SliderRow label="Ambient light" value={display.ambientLight} min={0} max={100} unit="%" onChange={(v) => updateDisplay({ ambientLight: v })} />
        )}
        <ToggleRow label="Night mode" on={display.nightMode} onChange={(v) => updateDisplay({ nightMode: v })} />
      </div>

      <div className="rd-m-card">
        <div className="rd-m-card-title">SPEED SOURCE</div>
        {(['AUTO', 'OBD', 'GPS'] as const).map((mode) => (
          <div className="rd-m-row clickable" key={mode} onClick={() => updateDisplay({ speedSourceMode: mode })}>
            <span className="rd-m-row-label">{mode}</span>
            {display.speedSourceMode === mode && <span style={{ color: '#8fcb83', fontSize: 12 }}>ACTIVE</span>}
          </div>
        ))}
      </div>

      <div className="rd-m-card">
        <ToggleRow label="Media ticker on dashboard" on={display.mediaTickerEnabled} onChange={(v) => updateDisplay({ mediaTickerEnabled: v })} />
        <ToggleRow label="Startup animation" on={display.startupAnimationEnabled} onChange={(v) => updateDisplay({ startupAnimationEnabled: v })} />
      </div>
    </div>
  )
}
