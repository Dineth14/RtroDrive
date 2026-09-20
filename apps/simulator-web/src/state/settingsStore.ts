import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  DisplaySettings,
  SoundSettings,
  ThemeName,
  VehicleProfile,
  WarningThresholds,
} from '@/types/vehicle'
import { VEHICLE_PRESETS } from '@/types/vehicle'
import { getVisualProfile } from '@/vehicleProfiles/profiles'
import { useMediaStore } from './mediaStore'
const defaultVehicle = VEHICLE_PRESETS.find(p => p.id === 'jzx100')!

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
  clusterLayout: 'JDM_GT_93',
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
      vehicleProfile: defaultVehicle,
      display: defaultDisplay,
      sound: defaultSound,
      warnings: defaultWarnings,

      setVehicleProfile: (profile) => set(s=>{
        if(s.vehicleProfile.id===profile.id)return {vehicleProfile:profile}
        const visual=getVisualProfile(profile)
        useMediaStore.getState().setVisualStyle(visual.defaultMediaTheme)
        return {vehicleProfile:profile,display:{...s.display,clusterLayout:visual.defaultClusterTheme,theme:visual.palette}}
      }),
      setVehiclePresetById: (id) => {
        const preset = VEHICLE_PRESETS.find((p) => p.id === id)
        if (!preset) return
        const visual = getVisualProfile(preset)
        useMediaStore.getState().setVisualStyle(visual.defaultMediaTheme)
        set((s) => ({
          vehicleProfile: preset,
          display: { ...s.display, clusterLayout: visual.defaultClusterTheme, theme: visual.palette },
        }))
      },
      setTheme: (theme) => set((s) => ({ display: { ...s.display, theme } })),
      updateDisplay: (patch) => set((s) => ({ display: { ...s.display, ...patch } })),
      updateSound: (patch) => set((s) => ({ sound: { ...s.sound, ...patch } })),
      updateWarningThresholds: (patch) =>
        set((s) => ({ warnings: { ...s.warnings, ...patch } })),
      resetToDefaults: () => {
        useMediaStore.getState().setVisualStyle('EQ_DECK_89')
        set({
          vehicleProfile: defaultVehicle,
          display: defaultDisplay,
          sound: defaultSound,
          warnings: defaultWarnings,
        })
      },
    }),
    {
      name: 'retrodrive-settings',
      version: 5,
      migrate: (persisted) => {
        const p = (persisted ?? {}) as Partial<SettingsState>
        return {
          vehicleProfile: p.vehicleProfile?.id === 'minimpi' && p.vehicleProfile.engine === '1.3i SPi'
            ? { ...p.vehicleProfile, year: 1998, engine: '1.3i MPi' }
            : p.vehicleProfile ?? defaultVehicle,
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
