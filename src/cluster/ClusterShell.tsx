import { useEffect, useRef } from 'react'
import { useVehicleStore } from '@/state/vehicleStore'
import { useSettingsStore } from '@/state/settingsStore'
import { applyClusterTheme } from '@/theme/themes'
import { BootSequence } from './BootSequence'
import { DashboardScreen } from './DashboardScreen'
import { DiagnosticsScreen } from './DiagnosticsScreen'
import { VehicleHealthScreen } from './VehicleHealthScreen'
import { MediaScreen } from './MediaScreen'
import { TripScreen } from './TripScreen'
import { WarningOverlay } from './WarningOverlay'
import { StatusBar } from './StatusBar'
import { TestModeScreen } from './TestModeScreen'
import './ClusterShell.css'

export function ClusterShell() {
  const rootRef = useRef<HTMLDivElement>(null)
  const theme = useSettingsStore((s) => s.display.theme)
  const brightness = useSettingsStore((s) => s.display.brightness)
  const bootPhase = useVehicleStore((s) => s.bootPhase)
  const ignition = useVehicleStore((s) => s.ignition)
  const activeScreen = useVehicleStore((s) => s.activeClusterScreen)

  useEffect(() => {
    if (rootRef.current) applyClusterTheme(theme, rootRef.current)
  }, [theme])

  const booting = bootPhase !== 'IDLE' && bootPhase !== 'DONE'
  const showIgnitionOff = !booting && ignition === 'OFF'

  return (
    <div
      ref={rootRef}
      className="rd-cluster"
      style={{ filter: `brightness(${0.55 + (brightness / 100) * 0.55})` }}
    >
      {booting && <BootSequence />}

      {!booting && showIgnitionOff && (
        <div className="rd-ignition-off">IGNITION OFF — PRESS SPACE OR USE DEV PANEL</div>
      )}

      {!booting && !showIgnitionOff && (
        <>
          <StatusBar />
          {activeScreen === 'DASHBOARD' && <DashboardScreen />}
          {activeScreen === 'DIAGNOSTICS' && <DiagnosticsScreen />}
          {activeScreen === 'HEALTH' && <VehicleHealthScreen />}
          {activeScreen === 'TRIP' && <TripScreen />}
          {activeScreen === 'MEDIA' && <MediaScreen />}
          {activeScreen === 'TEST' && <TestModeScreen />}
          <WarningOverlay />
          <div className="rd-nav-hint">1 DASH · 2 DIAG · 3 TRIP · 4 MEDIA · H HEALTH</div>
        </>
      )}

      <div className="rd-cluster-vignette" />
      <div className="rd-cluster-scanlines" />
    </div>
  )
}
