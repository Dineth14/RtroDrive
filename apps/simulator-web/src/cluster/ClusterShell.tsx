import { useEffect, useRef } from 'react'
import { useVehicleStore } from '@/state/vehicleStore'
import { useSettingsStore } from '@/state/settingsStore'
import { applyClusterTheme } from '@/theme/themes'
import { BootSequence } from './BootSequence'
import { DashboardScreen } from './DashboardScreen'
import { PerformanceScreen } from './PerformanceScreen'
import { GpsScreen } from './GpsScreen'
import { DiagnosticsScreen } from './DiagnosticsScreen'
import { VehicleHealthScreen } from './VehicleHealthScreen'
import { MediaScreen } from './MediaScreen'
import { TripScreen } from './TripScreen'
import { WarningOverlay } from './WarningOverlay'
import { StatusBar } from './StatusBar'
import { TestModeScreen } from './TestModeScreen'
import { TerrainScreen } from './TerrainScreen'
import './ClusterShell.css'
import { getVisualProfile, isClassicLayout, isOffRoadLayout } from '@/vehicleProfiles/profiles'

export function ClusterShell() {
  const rootRef = useRef<HTMLDivElement>(null)
  const vehicle = useSettingsStore(s => s.vehicleProfile)
  const layout = useSettingsStore(s => s.display.clusterLayout)
  const visual = getVisualProfile(vehicle)
  const classic = isClassicLayout(layout)
  const theme = useSettingsStore((s) => s.display.theme)
  const brightness = useSettingsStore((s) => s.display.brightness)
  const autoBrightness = useSettingsStore((s) => s.display.autoBrightness)
  const ambientLight = useSettingsStore((s) => s.display.ambientLight)
  const nightMode = useSettingsStore((s) => s.display.nightMode)
  const bootPhase = useVehicleStore((s) => s.bootPhase)
  const ignition = useVehicleStore((s) => s.ignition)
  const activeScreen = useVehicleStore((s) => s.activeClusterScreen)
  const hasWarnings = useVehicleStore((s) => s.warnings.length > 0)

  useEffect(() => {
    if (rootRef.current) applyClusterTheme(classic ? 'HERITAGE_IVORY' : theme, rootRef.current)
  }, [theme, classic])

  const booting = bootPhase !== 'IDLE' && bootPhase !== 'DONE'
  const showIgnitionOff = !booting && ignition === 'OFF'

  const effectiveBrightness = autoBrightness ? 25 + ambientLight * 0.65 : brightness
  const brightnessMultiplier = 0.5 + (effectiveBrightness / 100) * 0.58
  const filter = nightMode
    ? `brightness(${brightnessMultiplier * 0.82}) saturate(0.88) sepia(0.12)`
    : `brightness(${brightnessMultiplier})`

  return (
    <div ref={rootRef} className="rd-cluster" data-era={classic ? 'CLASSIC_60' : visual.era === 'CLASSIC_60' ? 'DIGITAL_80' : visual.era} data-night={nightMode} style={{ filter }}>
      {booting && <BootSequence />}

      {!booting && showIgnitionOff && (
        <div className="rd-ignition-off">IGNITION OFF — PRESS SPACE OR USE DEV PANEL</div>
      )}

      {!booting && !showIgnitionOff && (
        <>
          <StatusBar />
          {activeScreen === 'DASHBOARD' && <DashboardScreen />}
          {activeScreen === 'PERFORMANCE' && <PerformanceScreen />}
          {activeScreen === 'GPS' && <GpsScreen />}
          {activeScreen === 'DIAGNOSTICS' && <DiagnosticsScreen />}
          {activeScreen === 'HEALTH' && <VehicleHealthScreen />}
          {activeScreen === 'TRIP' && <TripScreen />}
          {activeScreen === 'MEDIA' && <MediaScreen />}
          {activeScreen === 'TERRAIN' && <TerrainScreen />}
          {activeScreen === 'TEST' && <ParkedDisplayTest />}
          <WarningOverlay />
          {!hasWarnings && (
            <div className="rd-nav-hint">1 DASH · 2 PERF · 3 GPS · 4 HEALTH · 5 DIAG · 6 MEDIA · 7 TRIP{isOffRoadLayout(layout) ? ' · 8 TERRAIN' : ''}</div>
          )}
        </>
      )}

      <div className="rd-cluster-vignette" />
      <div className="rd-cluster-scanlines" />
    </div>
  )
}

function ParkedDisplayTest(){
  const moving=useVehicleStore(s=>s.telemetry.speedKph.value>5)
  return moving?<DashboardScreen/>:<TestModeScreen/>
}
