import { useVehicleStore } from '@/state/vehicleStore'
import { useSettingsStore } from '@/state/settingsStore'
import { useMediaStore } from '@/state/mediaStore'
import type { ActiveWarning, WarningSeverity } from '@/types/telemetry'
import type { HealthStatus } from '@/types/diagnostics'
import { evaluateDiagnosticRules } from './diagnosticEngine'
import { criticalAlarm, speedChime, warningChime, infoChime, duckMedia } from '@/audio/sounds'

let lastSpeedChimeAt = 0
let wasBelowThreshold = true
let voltageTrend: number[] = []
let lastRepeatAt = 0

function makeWarning(
  id: string,
  severity: WarningSeverity,
  title: string,
  detail: string,
  source: string,
  value?: string
): ActiveWarning {
  return { id, severity, title, detail, value, acknowledged: false, createdAt: Date.now(), source }
}

function playSeverity(severity: WarningSeverity) {
  const sound = useSettingsStore.getState().sound
  if (!sound.soundEnabled) return
  if (severity === 'CRITICAL') {
    criticalAlarm()
    if (sound.mediaDuckingEnabled) duckMedia(0.15, 2200)
  } else if (severity === 'WARNING') {
    warningChime()
  } else if (severity === 'ADVISORY') {
    infoChime()
  }
}

export function evaluateFaultsAndHealth() {
  const vStore = useVehicleStore.getState()
  const settings = useSettingsStore.getState()
  const { telemetry, connections, engine, warnings, ignition } = vStore
  const thresholds = settings.warnings
  const running = engine === 'RUNNING' || engine === 'IDLE'

  const existingIds = new Set(warnings.map((w) => w.id))
  const desired: ActiveWarning[] = []
  if(settings.vehicleProfile.isTurbocharged && telemetry.boostBar.available){
    const boost=telemetry.boostBar.value
    if(boost>=settings.vehicleProfile.boostCriticalBar) desired.push(makeWarning('boost-critical','CRITICAL','OVERBOOST','LIFT THROTTLE / CHECK BOOST CONTROL','boost',boost.toFixed(2)+' bar'))
    else if(boost>=settings.vehicleProfile.boostWarningBar) desired.push(makeWarning('boost-warning','WARNING','BOOST HIGH','REDUCE ENGINE LOAD','boost',boost.toFixed(2)+' bar'))
  }

  // ---- Fuel low ----
  if (telemetry.fuelPercent.available && telemetry.fuelPercent.value < thresholds.fuelLowPercent) {
    desired.push(
      makeWarning('fuel-low', 'ADVISORY', 'FUEL LOW', 'Refuel soon', 'fuel', `${telemetry.fuelPercent.value.toFixed(0)}%`)
    )
  }

  // ---- Battery ----
  if (running && telemetry.batteryVoltage.available) {
    const v = telemetry.batteryVoltage.value
    if (v < thresholds.voltageCriticalV) {
      desired.push(makeWarning('battery-critical', 'CRITICAL', 'CHARGING SYSTEM', 'VOLTAGE CRITICALLY LOW', 'battery', `${v.toFixed(1)} V`))
    } else if (v < thresholds.voltageLowRunningV) {
      desired.push(makeWarning('battery-low', 'WARNING', 'CHARGING SYSTEM', 'VOLTAGE LOW', 'battery', `${v.toFixed(1)} V`))
    }
  }

  // ---- Coolant ----
  if (telemetry.coolantTempC.available) {
    const c = telemetry.coolantTempC.value
    if (c > thresholds.coolantCriticalC) {
      desired.push(makeWarning('coolant-critical', 'CRITICAL', 'COOLANT HIGH', 'REDUCE LOAD / CHECK COOLING', 'coolant', `${c.toFixed(0)}°C`))
    } else if (c > thresholds.coolantWarningC) {
      desired.push(makeWarning('coolant-warning', 'WARNING', 'COOLANT HIGH', 'MONITOR TEMPERATURE', 'coolant', `${c.toFixed(0)}°C`))
    }
  }

  // ---- Oil pressure ----
  if (running && telemetry.oilPressureBar.available && telemetry.oilPressureBar.value < 0.8 && telemetry.rpm.value > 1100) {
    desired.push(makeWarning('oil-pressure-critical', 'CRITICAL', 'OIL PRESSURE LOW', 'STOP ENGINE SAFELY', 'oil', `${telemetry.oilPressureBar.value.toFixed(1)} bar`))
  }

  // ---- GPS ----
  if (connections.gps !== 'FIX' && ignition !== 'OFF') {
    desired.push(makeWarning('gps-unavailable', 'INFO', 'GPS UNAVAILABLE', 'Using OBD speed source', 'gps'))
  }

  // ---- OBD ----
  if (connections.obd !== 'CONNECTED' && ignition !== 'OFF') {
    desired.push(makeWarning('obd-disconnected', 'WARNING', 'OBD DISCONNECTED', 'Vehicle link lost', 'obd'))
  }

  // ---- Active DTC warnings ----
  for (const dtc of vStore.dtcs) {
    if (dtc.status === 'ACTIVE' && (dtc.severity === 'WARNING' || dtc.severity === 'CRITICAL')) {
      desired.push(makeWarning(`dtc-${dtc.code}`, dtc.severity, dtc.code, dtc.description, `dtc-${dtc.code}`))
    }
  }

  // Reconcile: add new, keep acknowledged flags, remove resolved.
  // Manually-injected warnings (dev shortcuts) use the 'manual' source and
  // are left alone here — they're cleared explicitly by the user instead.
  const desiredIds = new Set(desired.map((w) => w.id))
  for (const w of desired) {
    if (!existingIds.has(w.id)) {
      vStore.pushWarning(w)
      playSeverity(w.severity)
    }
  }
  for (const w of warnings) {
    if (w.source === 'manual') continue
    if (!desiredIds.has(w.id)) vStore.clearWarning(w.id)
  }

  const currentWarnings=useVehicleStore.getState().warnings
  const critical=currentWarnings.some(w=>w.severity==='CRITICAL')
  useMediaStore.getState().setDucked(critical&&settings.sound.mediaDuckingEnabled)
  const repeat=currentWarnings.find(w=>w.severity==='CRITICAL'&&!w.acknowledged)??currentWarnings.find(w=>w.severity==='WARNING'&&!w.acknowledged)
  if(repeat&&Date.now()-lastRepeatAt>(repeat.severity==='CRITICAL'?2200:6000)) {playSeverity(repeat.severity);lastRepeatAt=Date.now()}

  // ---- Speed chime ----
  if (settings.sound.speedChimeEnabled && running) {
    const speed = telemetry.speedKph.value
    const threshold = settings.sound.speedChimeThresholdKph
    const now = Date.now()
    if (speed >= threshold && wasBelowThreshold && now - lastSpeedChimeAt > 4000) {
      if (settings.sound.soundEnabled) speedChime()
      lastSpeedChimeAt = now
      wasBelowThreshold = false
    } else if (speed < threshold - 3) {
      wasBelowThreshold = true
    }
  }

  // ---- Diagnostic rules -> DTCs ----
  const newDtcs = evaluateDiagnosticRules(telemetry, running)
  for (const dtc of newDtcs) {
    vStore.addOrUpdateDtc(dtc)
  }

  // ---- Vehicle health ----
  voltageTrend.push(telemetry.batteryVoltage.value)
  if (voltageTrend.length > 20) voltageTrend.shift()

  const engineStatus: HealthStatus = vStore.dtcs.some((d) => d.status === 'ACTIVE' && d.code === 'P0301')
    ? 'WARNING'
    : 'NORMAL'
  const coolantStatus: HealthStatus =
    telemetry.coolantTempC.value > thresholds.coolantCriticalC
      ? 'WARNING'
      : telemetry.coolantTempC.value > thresholds.coolantWarningC
        ? 'OBSERVE'
        : 'NORMAL'
  const electricalTrendDropping = voltageTrend.length >= 5 && voltageTrend[voltageTrend.length - 1] < voltageTrend[0] - 0.3
  const electricalStatus: HealthStatus = vStore.dtcs.some((d) => d.status === 'ACTIVE' && d.code === 'P0562')
    ? 'WARNING'
    : electricalTrendDropping
      ? 'OBSERVE'
      : 'NORMAL'
  const fuelSystemStatus: HealthStatus = vStore.dtcs.some((d) => d.status === 'ACTIVE' && d.code === 'P0171')
    ? 'WARNING'
    : 'NORMAL'
  const sensorsStatus: HealthStatus = vStore.dtcs.some((d) => d.status === 'ACTIVE' && d.code === 'P0117')
    ? 'WARNING'
    : 'NORMAL'
  const connectivityStatus: HealthStatus =
    connections.obd === 'CONNECTED' && connections.phone === 'CONNECTED' && connections.gps === 'FIX' ? 'NORMAL' : 'OBSERVE'

  vStore.updateHealthCategory('ENGINE', {
    status: engineStatus,
    evidenceLines: engineStatus === 'WARNING' ? ['Misfire pattern reported on cylinder 1.'] : ['No abnormal patterns detected.'],
    statusNote: engineStatus === 'WARNING' ? 'INSPECT IGNITION / FUEL DELIVERY' : 'MONITORING',
  })
  vStore.updateHealthCategory('COOLING', {
    status: coolantStatus,
    evidenceLines: [`Current coolant: ${telemetry.coolantTempC.value.toFixed(0)}°C`, `Trip max: ${telemetry.maxCoolantC.value.toFixed(0)}°C`],
    statusNote: coolantStatus === 'NORMAL' ? 'MONITORING' : 'MONITOR COOLING SYSTEM',
  })
  vStore.updateHealthCategory('ELECTRICAL', {
    status: electricalStatus,
    evidenceLines: [`Charging voltage trend: ${voltageTrend.slice(-3).map((v) => v.toFixed(1)).join(' → ')} V`],
    statusNote: electricalStatus === 'NORMAL' ? 'MONITORING' : 'MONITOR BATTERY / ALTERNATOR',
  })
  vStore.updateHealthCategory('FUEL_SYSTEM', {
    status: fuelSystemStatus,
    evidenceLines: [`STFT ${telemetry.shortFuelTrimPercent.value.toFixed(0)}%`, `LTFT ${telemetry.longFuelTrimPercent.value.toFixed(0)}%`],
    statusNote: fuelSystemStatus === 'NORMAL' ? 'MONITORING' : 'PATTERN CONSISTENT WITH INTAKE LEAK',
  })
  vStore.updateHealthCategory('SENSORS', {
    status: sensorsStatus,
    evidenceLines: [sensorsStatus === 'NORMAL' ? 'All monitored sensors reporting.' : 'Coolant sensor signal implausible.'],
    statusNote: sensorsStatus === 'NORMAL' ? 'MONITORING' : 'CHECK SENSOR WIRING',
  })
  vStore.updateHealthCategory('CONNECTIVITY', {
    label:'POSITION / LINKS',
    status: connectivityStatus,
    evidenceLines: [`OBD: ${connections.obd}`, `PHONE: ${connections.phone}`, `GPS: ${connections.gps}`],
    statusNote: connectivityStatus === 'NORMAL' ? 'ALL LINKS NOMINAL' : 'ONE OR MORE LINKS DEGRADED',
  })
}

export function resetFaultEngineState() {
  lastRepeatAt = 0
  lastSpeedChimeAt = 0
  wasBelowThreshold = true
  voltageTrend = []
}
