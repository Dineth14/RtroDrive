export type DtcSeverity = 'INFO' | 'ADVISORY' | 'WARNING' | 'CRITICAL'
export type DtcStatus = 'ACTIVE' | 'PENDING' | 'STORED' | 'CLEARED'

export interface FreezeFrame {
  rpm: number
  speedKph: number
  coolantTempC: number
  engineLoadPercent: number
  shortFuelTrimPercent: number
  longFuelTrimPercent: number
  intakeTempC: number
  mapKpa: number
  timestamp: number
}

export interface DtcEvidenceItem {
  label: string
  value: string
  note?: string
}

export interface DtcRecord {
  code: string
  description: string
  severity: DtcSeverity
  status: DtcStatus
  timestamp: number
  lastObserved: number
  freezeFrame: FreezeFrame | null
  evidence: DtcEvidenceItem[]
  possibleSystems: string[]
  recommendedChecks: string[]
  confidence: 'LOW' | 'MODERATE' | 'HIGH'
  source: 'OBD' | 'SIMULATED'
}

export interface AiEvidenceBundle {
  dtc: DtcRecord
  livePids: Record<string, number | string>
  historicalTrend?: string
}

export interface AiAnalysisResult {
  summary: string
  evidence: string[]
  possibleCauses: string[]
  recommendedOrder: string[]
  severity: DtcSeverity
  whatNotToDo: string[]
  disclaimer: string
}

export type HealthCategoryKey =
  | 'ENGINE'
  | 'COOLING'
  | 'ELECTRICAL'
  | 'FUEL_SYSTEM'
  | 'SENSORS'
  | 'CONNECTIVITY'

export type HealthStatus = 'NORMAL' | 'OBSERVE' | 'WARNING' | 'UNKNOWN'

export interface HealthCategory {
  key: HealthCategoryKey
  label: string
  status: HealthStatus
  evidenceLines: string[]
  statusNote: string
}
