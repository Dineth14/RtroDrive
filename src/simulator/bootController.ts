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
  store.clearBreadcrumb()
  resetAutoDrive()

  store.setBootPhase('BLACK')
  store.setConnections({ obd: 'CONNECTING', gps: 'SEARCHING', phone: 'CONNECTING', audio: 'CONNECTED' })
  store.setHardware({ can: 'CONNECTING', obdProtocol: 'CONNECTING', gnss: 'CONNECTING' })

  const schedule = (ms: number, fn: () => void) => {
    bootTimers.push(window.setTimeout(fn, ms))
  }

  schedule(150, () => {
    if (useSettingsStore.getState().sound.startupSoundEnabled) startupChime()
    store.setBootPhase('SEGMENT_TEST')
  })

  schedule(650, () => {
    store.setBootPhase('LAMP_TEST')
  })

  schedule(1050, () => {
    store.setBootPhase('RPM_SWEEP')
  })

  schedule(1750, () => {
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

  schedule(2650, () => {
    store.setBootPhase('SYSTEM_OK')
  })

  schedule(3150, () => {
    store.setBootPhase('DONE')
    store.setEngine('IDLE')
  })
}

export function cancelBootSequence() {
  clearBootTimers()
}
