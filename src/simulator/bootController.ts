import { useVehicleStore } from '@/state/vehicleStore'
import { useSettingsStore } from '@/state/settingsStore'
import { startupChime } from '@/audio/sounds'
import { resetAutoDrive } from './telemetryEngine'

let bootTimers: number[] = []

function clearBootTimers() {
  bootTimers.forEach((id) => window.clearTimeout(id))
  bootTimers = []
}

export function triggerBootSequence() {
  clearBootTimers()
  const store = useVehicleStore.getState()
  store.setIgnition('ON')
  store.setActiveClusterScreen('DASHBOARD')
  if (!useSettingsStore.getState().display.startupAnimationEnabled) {
    store.setBootPhase('DONE')
    store.setConnections({ obd: 'CONNECTED', gps: 'FIX', phone: 'CONNECTED', audio: 'CONNECTED' })
    store.setHardware({can:'CONNECTED',obdProtocol:'CONNECTED',gnss:'CONNECTED'})
    store.setEngine('IDLE')
    return
  }
  resetAutoDrive()

  store.setBootPhase('BLACK')
  store.setConnections({ obd: 'CONNECTING', gps: 'SEARCHING', phone: 'CONNECTING', audio: 'CONNECTED' })
  store.setHardware({ can: 'CONNECTING', obdProtocol: 'CONNECTING', gnss: 'CONNECTING' })

  const schedule = (ms: number, fn: () => void) => {
    bootTimers.push(window.setTimeout(()=>{if(useVehicleStore.getState().ignition!=='OFF')fn()}, ms))
  }

  schedule(150, () => {
    if (useSettingsStore.getState().sound.startupSoundEnabled) startupChime()
    store.setBootPhase('SEGMENT_TEST')
  })

  schedule(2300, () => {
    store.setBootPhase('LAMP_TEST')
  })

  schedule(2550, () => {
    store.setBootPhase('RPM_SWEEP')
  })

  schedule(1250, () => {
    store.setBootPhase('STATUS_INIT')
  })

  schedule(2000, () => {
    store.setHardware({ can: 'CONNECTED', obdProtocol: 'CONNECTED' })
    store.setConnections({ obd: 'CONNECTED' })
  })
  schedule(2200, () => {
    store.setHardware({ gnss: 'CONNECTED' })
    store.setConnections({ gps: 'FIX' })
  })
  schedule(2400, () => {
    store.setConnections({ phone: 'CONNECTED' })
  })

  schedule(3550, () => {
    store.setBootPhase('SYSTEM_OK')
  })

  schedule(3900, () => {
    store.setBootPhase('DONE')
    store.setEngine('IDLE')
  })
}

export function cancelBootSequence() {
  clearBootTimers()
}
