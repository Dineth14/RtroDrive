import { useSettingsStore } from '@/state/settingsStore'
import { configureAudio } from '@/audio/sounds'
import { SliderRow, ToggleRow } from './MobileControls'
import './mobile.css'

export function SoundSettingsScreen() {
  const sound = useSettingsStore((s) => s.sound)
  const updateSound = useSettingsStore((s) => s.updateSound)

  const set = (patch: Partial<typeof sound>) => {
    updateSound(patch)
    configureAudio({
      masterVolume: (patch.masterVolume ?? sound.masterVolume) / 100,
      warningVolume: (patch.warningVolume ?? sound.warningVolume) / 100,
      soundEnabled: patch.soundEnabled ?? sound.soundEnabled,
    })
  }

  return (
    <div>
      <div className="rd-m-card">
        <ToggleRow label="Sound enabled" on={sound.soundEnabled} onChange={(v) => set({ soundEnabled: v })} />
        <SliderRow label="Master volume" value={sound.masterVolume} min={0} max={100} unit="%" onChange={(v) => set({ masterVolume: v })} />
        <SliderRow label="Warning volume" value={sound.warningVolume} min={0} max={100} unit="%" onChange={(v) => set({ warningVolume: v })} />
      </div>

      <div className="rd-m-card">
        <ToggleRow label="Startup sound" on={sound.startupSoundEnabled} onChange={(v) => set({ startupSoundEnabled: v })} />
        <ToggleRow label="Connection sounds" on={sound.connectionSoundsEnabled} onChange={(v) => set({ connectionSoundsEnabled: v })} />
        <ToggleRow label="Duck media on warning" on={sound.mediaDuckingEnabled} onChange={(v) => set({ mediaDuckingEnabled: v })} />
      </div>

      <div className="rd-m-card">
        <ToggleRow label="Speed chime" on={sound.speedChimeEnabled} onChange={(v) => set({ speedChimeEnabled: v })} />
        <SliderRow
          label="Speed chime threshold"
          value={sound.speedChimeThresholdKph}
          min={40}
          max={200}
          step={5}
          unit=" km/h"
          onChange={(v) => set({ speedChimeThresholdKph: v })}
        />
      </div>
    </div>
  )
}
