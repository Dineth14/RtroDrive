import { useVehicleStore } from '@/state/vehicleStore'
import { useSettingsStore } from '@/state/settingsStore'
import { useMediaStore, TRACKS } from '@/state/mediaStore'

export function useDashboardData(testValue?: number) {
  const live = useVehicleStore((s) => s.telemetry)
  const telemetry = testValue === undefined ? live : {...live,
    speedKph:{...live.speedKph,value:888}, rpm:{...live.rpm,value:8000*testValue},
    fuelPercent:{...live.fuelPercent,value:100*testValue,available:true}, coolantTempC:{...live.coolantTempC,value:130*testValue,available:true}}
  const speedSourceActive = useVehicleStore((s) => s.speedSourceActive)
  const connections = useVehicleStore((s) => s.connections)
  const display = useSettingsStore((s) => s.display)
  const warnings = useSettingsStore((s) => s.warnings)
  const vehicle = useSettingsStore((s) => s.vehicleProfile)
  const isPlaying = useMediaStore((s) => s.isPlaying)
  const currentTrackId = useMediaStore((s) => s.currentTrackId)
  const track = TRACKS.find((t) => t.id === currentTrackId) ?? TRACKS[0]

  return { telemetry, speedSourceActive, connections, display, warnings, vehicle, isPlaying, track }
}

export function formatClock(date: Date) {
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function headingToCompass(deg: number) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}
