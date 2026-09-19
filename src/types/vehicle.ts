export type ThemeName = 'JDM_PHOSPHOR' | 'JDM_AMBER' | 'EURO_GREEN' | 'MONO_LCD'
export type SpeedUnit = 'KPH' | 'MPH'
export type TempUnit = 'C' | 'F'
export type BoostUnit = 'BAR' | 'PSI'

export type ClusterLayoutId = 'JDM_DIGITAL_86' | 'EURO_DIGITAL_89' | 'JDM_GT_93' | 'TOURING_96' | 'CLASSIC_ELECTRONIC'

export type AuxSlotValue =
  | 'BOOST'
  | 'OIL_PRESSURE'
  | 'OIL_TEMP'
  | 'COOLANT'
  | 'IAT'
  | 'BATTERY'
  | 'FUEL'
  | 'ENGINE_LOAD'
  | 'MAP'
  | 'MAF'
  | 'STFT'
  | 'LTFT'

export interface VehicleProfile {
  id: string
  nickname: string
  manufacturer: string
  model: string
  year: number
  engine: string
  fuelType: string
  redlineRpm: number
  speedUnit: SpeedUnit
  tempUnit: TempUnit
  isTurbocharged: boolean
  boostUnit: BoostUnit
  maxBoostBar: number
  boostWarningBar: number
  boostCriticalBar: number
}

export interface WarningThresholds {
  coolantWarningC: number
  coolantCriticalC: number
  voltageLowRunningV: number
  voltageCriticalV: number
  fuelLowPercent: number
}

export interface SoundSettings {
  masterVolume: number
  warningVolume: number
  soundEnabled: boolean
  startupSoundEnabled: boolean
  speedChimeEnabled: boolean
  speedChimeThresholdKph: number
  connectionSoundsEnabled: boolean
  mediaDuckingEnabled: boolean
}

export type PrimaryColorName = 'PHOSPHOR_GREEN' | 'AMBER' | 'ICE_GREEN'

export interface DisplaySettings {
  theme: ThemeName
  clusterLayout: ClusterLayoutId
  primaryColor: PrimaryColorName
  brightness: number
  autoBrightness: boolean
  ambientLight: number
  nightMode: boolean
  speedSourceMode: 'AUTO' | 'OBD' | 'GPS'
  mediaTickerEnabled: boolean
  startupAnimationEnabled: boolean
  auxSlots: [AuxSlotValue, AuxSlotValue, AuxSlotValue, AuxSlotValue]
}

export const VEHICLE_PRESETS: VehicleProfile[] = [
  {
    id: 'jzx100',
    nickname: 'JZX100 MARK II',
    manufacturer: 'Toyota',
    model: 'Mark II JZX100 1JZ-GTE',
    year: 1997,
    engine: '1JZ-GTE',
    fuelType: 'Petrol',
    redlineRpm: 7000,
    speedUnit: 'KPH',
    tempUnit: 'C',
    isTurbocharged: true,
    boostUnit: 'BAR',
    maxBoostBar: 1.4,
    boostWarningBar: 1.2,
    boostCriticalBar: 1.4,
  },
  {
    id: 'evo6',
    nickname: 'EVO VI',
    manufacturer: 'Mitsubishi',
    model: 'Lancer Evolution VI 4G63T',
    year: 1999,
    engine: '4G63T',
    fuelType: 'Petrol',
    redlineRpm: 7500,
    speedUnit: 'KPH',
    tempUnit: 'C',
    isTurbocharged: true,
    boostUnit: 'BAR',
    maxBoostBar: 1.3,
    boostWarningBar: 1.1,
    boostCriticalBar: 1.3,
  },
  {
    id: 'gc8sti',
    nickname: 'GC8 STI',
    manufacturer: 'Subaru',
    model: 'Impreza WRX STI EJ20T',
    year: 1999,
    engine: 'EJ20T',
    fuelType: 'Petrol',
    redlineRpm: 7500,
    speedUnit: 'KPH',
    tempUnit: 'C',
    isTurbocharged: true,
    boostUnit: 'BAR',
    maxBoostBar: 1.3,
    boostWarningBar: 1.1,
    boostCriticalBar: 1.3,
  },
  {
    id: 'gdsti',
    nickname: 'GD STI',
    manufacturer: 'Subaru',
    model: 'Impreza WRX STI GD EJ207',
    year: 2003,
    engine: 'EJ207',
    fuelType: 'Petrol',
    redlineRpm: 8000,
    speedUnit: 'KPH',
    tempUnit: 'C',
    isTurbocharged: true,
    boostUnit: 'BAR',
    maxBoostBar: 1.4,
    boostWarningBar: 1.2,
    boostCriticalBar: 1.4,
  },
  {
    id: 'e46',
    nickname: 'E46 330i',
    manufacturer: 'BMW',
    model: '330i E46',
    year: 2001,
    engine: 'M54B30',
    fuelType: 'Petrol',
    redlineRpm: 6500,
    speedUnit: 'KPH',
    tempUnit: 'C',
    isTurbocharged: false,
    boostUnit: 'BAR',
    maxBoostBar: 0,
    boostWarningBar: 0,
    boostCriticalBar: 0,
  },
  {
    id: 'mx5nb',
    nickname: 'MX-5 NB',
    manufacturer: 'Mazda',
    model: 'MX-5 NB',
    year: 2000,
    engine: 'BP-ZE',
    fuelType: 'Petrol',
    redlineRpm: 7200,
    speedUnit: 'KPH',
    tempUnit: 'C',
    isTurbocharged: false,
    boostUnit: 'BAR',
    maxBoostBar: 0,
    boostWarningBar: 0,
    boostCriticalBar: 0,
  },
  {
    id: 'minimpi',
    nickname: 'ROVER MINI',
    manufacturer: 'Rover',
    model: 'Mini MPI',
    year: 1997,
    engine: '1.3i SPi',
    fuelType: 'Petrol',
    redlineRpm: 6000,
    speedUnit: 'KPH',
    tempUnit: 'C',
    isTurbocharged: false,
    boostUnit: 'BAR',
    maxBoostBar: 0,
    boostWarningBar: 0,
    boostCriticalBar: 0,
  },
  {
    id: 'generic-turbo',
    nickname: 'GENERIC TURBO',
    manufacturer: 'Generic',
    model: 'CAN OBD-II Turbo Vehicle',
    year: 2000,
    engine: 'Unknown Turbo',
    fuelType: 'Petrol',
    redlineRpm: 7000,
    speedUnit: 'KPH',
    tempUnit: 'C',
    isTurbocharged: true,
    boostUnit: 'BAR',
    maxBoostBar: 1.2,
    boostWarningBar: 1.0,
    boostCriticalBar: 1.2,
  },
  {
    id: 'generic-na',
    nickname: 'GENERIC OBD-II',
    manufacturer: 'Generic',
    model: 'CAN OBD-II Vehicle',
    year: 2000,
    engine: 'Unknown',
    fuelType: 'Petrol',
    redlineRpm: 7000,
    speedUnit: 'KPH',
    tempUnit: 'C',
    isTurbocharged: false,
    boostUnit: 'BAR',
    maxBoostBar: 0,
    boostWarningBar: 0,
    boostCriticalBar: 0,
  },
]

export const DEFAULT_LAYOUT_FOR_VEHICLE: Record<string, ClusterLayoutId> = {
  jzx100: 'JDM_GT_93',
  evo6: 'JDM_GT_93',
  gc8sti: 'JDM_GT_93',
  gdsti: 'JDM_GT_93',
  e46: 'EURO_DIGITAL_89',
  mx5nb: 'TOURING_96',
  minimpi: 'CLASSIC_ELECTRONIC',
  'generic-turbo': 'JDM_DIGITAL_86',
  'generic-na': 'JDM_DIGITAL_86',
}
