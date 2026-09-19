import type { AiAnalysisResult, DtcEvidenceItem, DtcRecord, FreezeFrame } from '@/types/diagnostics'
import type { TelemetrySnapshot } from '@/types/telemetry'

function snapshotFreezeFrame(t: TelemetrySnapshot): FreezeFrame {
  return {
    rpm: t.rpm.value,
    speedKph: t.speedKph.value,
    coolantTempC: t.coolantTempC.value,
    engineLoadPercent: t.engineLoadPercent.value,
    shortFuelTrimPercent: t.shortFuelTrimPercent.value,
    longFuelTrimPercent: t.longFuelTrimPercent.value,
    intakeTempC: t.intakeTempC.value,
    mapKpa: t.mapKpa.value,
    timestamp: Date.now(),
  }
}

interface DtcTemplate {
  code: string
  description: string
  possibleSystems: string[]
  recommendedChecks: string[]
}

export const DTC_LIBRARY: Record<string, DtcTemplate> = {
  P0171: {
    code: 'P0171',
    description: 'SYSTEM TOO LEAN — BANK 1',
    possibleSystems: ['Intake / vacuum system', 'Mass air flow sensor', 'Fuel delivery'],
    recommendedChecks: ['Intake hoses', 'Vacuum lines', 'PCV system', 'MAF readings', 'Fuel pressure'],
  },
  P0301: {
    code: 'P0301',
    description: 'CYLINDER 1 MISFIRE DETECTED',
    possibleSystems: ['Ignition system', 'Fuel injection', 'Compression'],
    recommendedChecks: ['Ignition coil / plug (cyl 1)', 'Injector (cyl 1)', 'Compression test', 'Vacuum leak near cyl 1'],
  },
  P0420: {
    code: 'P0420',
    description: 'CATALYST SYSTEM EFFICIENCY BELOW THRESHOLD — BANK 1',
    possibleSystems: ['Catalytic converter', 'Oxygen sensors', 'Exhaust leaks'],
    recommendedChecks: ['Upstream/downstream O2 sensor readings', 'Exhaust leak inspection', 'Catalyst condition'],
  },
  P0117: {
    code: 'P0117',
    description: 'ENGINE COOLANT TEMPERATURE CIRCUIT LOW INPUT',
    possibleSystems: ['Coolant temperature sensor', 'Sensor wiring/connector'],
    recommendedChecks: ['ECT sensor connector', 'Sensor resistance', 'Wiring for short to ground'],
  },
  P0562: {
    code: 'P0562',
    description: 'SYSTEM VOLTAGE LOW',
    possibleSystems: ['Charging system', 'Battery', 'Alternator / drive belt'],
    recommendedChecks: ['Battery terminals', 'Drive belt condition', 'Alternator output', 'Charging wiring'],
  },
}

export function createDtc(
  code: keyof typeof DTC_LIBRARY,
  telemetry: TelemetrySnapshot,
  evidence: DtcEvidenceItem[],
  severity: DtcRecord['severity'] = 'WARNING',
  confidence: DtcRecord['confidence'] = 'MODERATE'
): DtcRecord {
  const tpl = DTC_LIBRARY[code]
  const now = Date.now()
  return {
    code: tpl.code,
    description: tpl.description,
    severity,
    status: 'ACTIVE',
    timestamp: now,
    lastObserved: now,
    freezeFrame: snapshotFreezeFrame(telemetry),
    evidence,
    possibleSystems: tpl.possibleSystems,
    recommendedChecks: tpl.recommendedChecks,
    confidence,
    source: 'SIMULATED',
  }
}

interface RuleState {
  leanSustainedTicks: number
  voltageLowSustainedTicks: number
  sensorMissingTicks: number
}

export const ruleState: RuleState = {
  leanSustainedTicks: 0,
  voltageLowSustainedTicks: 0,
  sensorMissingTicks: 0,
}

export function resetRuleState() {
  ruleState.leanSustainedTicks = 0
  ruleState.voltageLowSustainedTicks = 0
  ruleState.sensorMissingTicks = 0
}

/**
 * Evaluate live-PID rules and return any newly-triggered DTCs.
 * Called at ~1Hz from the simulation loop. Pure function over
 * telemetry + small hysteresis counters — mirrors the structure a
 * real embedded rule engine would use.
 */
export function evaluateDiagnosticRules(
  telemetry: TelemetrySnapshot,
  engineRunning: boolean
): DtcRecord[] {
  const triggered: DtcRecord[] = []
  if (!engineRunning) {
    resetRuleState()
    return triggered
  }

  const stft = telemetry.shortFuelTrimPercent.value
  const ltft = telemetry.longFuelTrimPercent.value
  if (stft > 15 && ltft > 10) {
    ruleState.leanSustainedTicks++
  } else {
    ruleState.leanSustainedTicks = Math.max(0, ruleState.leanSustainedTicks - 1)
  }
  if (ruleState.leanSustainedTicks === 3) {
    triggered.push(
      createDtc(
        'P0171',
        telemetry,
        [
          { label: 'Short fuel trim (STFT)', value: `+${stft.toFixed(0)}%` },
          { label: 'Long fuel trim (LTFT)', value: `+${ltft.toFixed(0)}%` },
          { label: 'Idle correction', value: 'High', note: 'Correction elevated at idle relative to cruise RPM' },
        ],
        'WARNING',
        'MODERATE'
      )
    )
  }

  const voltage = telemetry.batteryVoltage.value
  if (voltage < 11.8) {
    ruleState.voltageLowSustainedTicks++
  } else {
    ruleState.voltageLowSustainedTicks = Math.max(0, ruleState.voltageLowSustainedTicks - 1)
  }
  if (ruleState.voltageLowSustainedTicks === 3) {
    triggered.push(
      createDtc(
        'P0562',
        telemetry,
        [
          { label: 'System voltage', value: `${voltage.toFixed(1)} V` },
          { label: 'Expected running range', value: '13.6 – 14.5 V' },
        ],
        voltage < 11.0 ? 'CRITICAL' : 'WARNING',
        'MODERATE'
      )
    )
  }

  if (!telemetry.coolantTempC.available) {
    ruleState.sensorMissingTicks++
  } else {
    ruleState.sensorMissingTicks = 0
  }
  if (ruleState.sensorMissingTicks === 2) {
    triggered.push(
      createDtc(
        'P0117',
        telemetry,
        [
          { label: 'Coolant sensor signal', value: 'Missing / implausible' },
          { label: 'Circuit behaviour', value: 'Reads below valid range' },
        ],
        'WARNING',
        'HIGH'
      )
    )
  }

  return triggered
}

export const diagnosticAssistant = {
  /**
   * Simulated AI-assisted analysis layer. Kept behind this function so
   * it can be swapped for a real API call later — see README for notes.
   */
  analyze(dtc: DtcRecord): AiAnalysisResult {
    const gen = ANALYSIS_GENERATORS[dtc.code]
    if (gen) return gen(dtc)
    return {
      summary: `Pattern consistent with ${dtc.description.toLowerCase()}.`,
      evidence: dtc.evidence.map((e) => `${e.label}: ${e.value}`),
      possibleCauses: dtc.possibleSystems,
      recommendedOrder: dtc.recommendedChecks,
      severity: dtc.severity,
      whatNotToDo: ['Do not assume a single component is confirmed faulty without inspection.'],
      disclaimer: 'This is guidance, not a confirmed mechanical diagnosis.',
    }
  },
}

const ANALYSIS_GENERATORS: Record<string, (dtc: DtcRecord) => AiAnalysisResult> = {
  P0171: (dtc) => ({
    summary:
      'LEAN CONDITION DETECTED. The available data shows elevated positive fuel correction, particularly at idle.',
    evidence: dtc.evidence.map((e) => `${e.label}: ${e.value}`),
    possibleCauses: [
      'Unmetered intake air (vacuum/intake leak)',
      'Airflow measurement error (MAF)',
      'Insufficient fuel delivery',
    ],
    recommendedOrder: ['Vacuum and intake hoses', 'PCV system', 'MAF readings', 'Fuel pressure', 'Injector operation'],
    severity: dtc.severity,
    whatNotToDo: ['Do not replace the MAF sensor before checking for intake leaks.'],
    disclaimer: 'This pattern can be consistent with unmetered intake air. This is guidance, not a confirmed mechanical diagnosis.',
  }),
  P0562: (dtc) => ({
    summary: 'CHARGING SYSTEM VOLTAGE LOW. Running voltage is below the expected charging range.',
    evidence: dtc.evidence.map((e) => `${e.label}: ${e.value}`),
    possibleCauses: ['Alternator output degraded', 'Charging circuit / wiring resistance', 'Battery unable to hold charge'],
    recommendedOrder: ['Battery terminals and ground straps', 'Drive belt condition', 'Alternator output under load', 'Charging wiring'],
    severity: dtc.severity,
    whatNotToDo: ['Do not assume the alternator has definitely failed without a load test.'],
    disclaimer: 'Possible causes include alternator or charging-circuit issues. This is guidance, not a confirmed mechanical diagnosis.',
  }),
  P0117: (dtc) => ({
    summary: 'COOLANT SENSOR SIGNAL IMPLAUSIBLE. The ECT circuit is reporting outside its valid range.',
    evidence: dtc.evidence.map((e) => `${e.label}: ${e.value}`),
    possibleCauses: ['Sensor connector corrosion/disconnection', 'Sensor internal failure', 'Wiring short to ground'],
    recommendedOrder: ['Inspect ECT connector', 'Check sensor resistance vs. spec', 'Inspect wiring harness'],
    severity: dtc.severity,
    whatNotToDo: ['Do not ignore — coolant-based cooling fan control may be affected.'],
    disclaimer: 'This is guidance, not a confirmed mechanical diagnosis.',
  }),
  P0301: (dtc) => ({
    summary: 'MISFIRE PATTERN DETECTED ON CYLINDER 1.',
    evidence: dtc.evidence.map((e) => `${e.label}: ${e.value}`),
    possibleCauses: ['Ignition component wear (coil/plug)', 'Injector delivery issue', 'Localized vacuum leak', 'Low compression'],
    recommendedOrder: ['Ignition coil / spark plug (cyl 1)', 'Injector balance test', 'Vacuum leak check near cyl 1', 'Compression test'],
    severity: dtc.severity,
    whatNotToDo: ['Do not continue sustained high-load operation while an active misfire is present.'],
    disclaimer: 'This is guidance, not a confirmed mechanical diagnosis.',
  }),
  P0420: (dtc) => ({
    summary: 'CATALYST EFFICIENCY BELOW THRESHOLD (STORED). Historical data suggests reduced catalyst performance.',
    evidence: dtc.evidence.map((e) => `${e.label}: ${e.value}`),
    possibleCauses: ['Aging catalytic converter', 'Oxygen sensor drift', 'Exhaust leak upstream of sensor'],
    recommendedOrder: ['Compare upstream/downstream O2 waveform', 'Inspect for exhaust leaks', 'Evaluate catalyst substrate condition'],
    severity: dtc.severity,
    whatNotToDo: ['Do not replace the catalytic converter before confirming O2 sensor behaviour.'],
    disclaimer: 'This is guidance, not a confirmed mechanical diagnosis.',
  }),
}
