import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  DisplaySettings,
  SoundSettings,
  ThemeName,
  VehicleProfile,
  WarningThresholds,
} from '@/types/vehicle'
import { VEHICLE_PRESETS, DEFAULT_LAYOUT_FOR_VEHICLE } from '@/types/vehicle'

interface SettingsState {
  vehicleProfile: VehicleProfile
  display: DisplaySettings
  sound: SoundSettings
  warnings: WarningThresholds

  setVehicleProfile: (profile: VehicleProfile) => void
  setVehiclePresetById: (id: string) => void
  setTheme: (theme: ThemeName) => void
  updateDisplay: (patch: Partial<DisplaySettings>) => void
  updateSound: (patch: Partial<SoundSettings>) => void
  updateWarningThresholds: (patch: Partial<WarningThresholds>) => void
  resetToDefaults: () => void
}

const defaultDisplay: DisplaySettings = {
  theme: 'JDM_PHOSPHOR',
  clusterLayout: 'JDM_DIGITAL_86',
  primaryColor: 'PHOSPHOR_GREEN',
  brightness: 85,
  autoBrightness: false,
  ambientLight: 60,
  nightMode: false,
  speedSourceMode: 'AUTO',
  mediaTickerEnabled: true,
  startupAnimationEnabled: true,
  auxSlots: ['BOOST', 'OIL_TEMP', 'BATTERY', 'IAT'],
}

const defaultSound: SoundSettings = {
  masterVolume: 70,
  warningVolume: 85,
  soundEnabled: true,
  startupSoundEnabled: true,
  speedChimeEnabled: true,
  speedChimeThresholdKph: 105,
  connectionSoundsEnabled: true,
  mediaDuckingEnabled: true,
}

const defaultWarnings: WarningThresholds = {
  coolantWarningC: 102,
  coolantCriticalC: 112,
  voltageLowRunningV: 12.5,
  voltageCriticalV: 11.5,
  fuelLowPercent: 15,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      vehicleProfile: VEHICLE_PRESETS[0],
      display: defaultDisplay,
      sound: defaultSound,
      warnings: defaultWarnings,

      setVehicleProfile: (profile) => set({ vehicleProfile: profile }),
      setVehiclePresetById: (id) => {
        const preset = VEHICLE_PRESETS.find((p) => p.id === id)
        if (!preset) return
        const layout = DEFAULT_LAYOUT_FOR_VEHICLE[id]
        set((s) => ({
          vehicleProfile: preset,
          display: layout ? { ...s.display, clusterLayout: layout } : s.display,
        }))
      },
      setTheme: (theme) => set((s) => ({ display: { ...s.display, theme } })),
      updateDisplay: (patch) => set((s) => ({ display: { ...s.display, ...patch } })),
      updateSound: (patch) => set((s) => ({ sound: { ...s.sound, ...patch } })),
      updateWarningThresholds: (patch) =>
        set((s) => ({ warnings: { ...s.warnings, ...patch } })),
      resetToDefaults: () =>
        set({
          vehicleProfile: VEHICLE_PRESETS[0],
          display: defaultDisplay,
          sound: defaultSound,
          warnings: defaultWarnings,
        }),
    }),
    {
      name: 'retrodrive-settings',
      version: 2,
      migrate: (persisted) => {
        const p = (persisted ?? {}) as Partial<SettingsState>
        return {
          vehicleProfile: p.vehicleProfile ?? VEHICLE_PRESETS[0],
          display: { ...defaultDisplay, ...(p.display ?? {}) },
          sound: { ...defaultSound, ...(p.sound ?? {}) },
          warnings: { ...defaultWarnings, ...(p.warnings ?? {}) },
        }
      },
      partialize: (s) => ({
        vehicleProfile: s.vehicleProfile,
        display: s.display,
        sound: s.sound,
        warnings: s.warnings,
      }),
    }
  )
)
