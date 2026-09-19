import { useSettingsStore } from '@/state/settingsStore'
import type { ThemeName } from '@/types/vehicle'
import { SliderRow, ToggleRow } from './MobileControls'
import './mobile.css'

const THEMES: { id: ThemeName; label: string }[] = [
  { id: 'JDM_PHOSPHOR', label: 'JDM PHOSPHOR' },
  { id: 'JDM_AMBER', label: 'JDM AMBER' },
  { id: 'EURO_GREEN', label: 'EURO GREEN' },
  { id: 'MONO_LCD', label: 'MONO LCD' },
]

export function DisplaySettingsScreen() {
  const display = useSettingsStore((s) => s.display)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const updateDisplay = useSettingsStore((s) => s.updateDisplay)

  return (
    <div>
      <div className="rd-m-section-label">THEME</div>
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
