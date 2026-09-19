export type ThemeName = 'JDM_PHOSPHOR' | 'JDM_AMBER' | 'EURO_GREEN' | 'MONO_LCD'
export type SpeedUnit = 'KPH' | 'MPH'
export type TempUnit = 'C' | 'F'

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

export interface DisplaySettings {
  theme: ThemeName
  brightness: number
  autoBrightness: boolean
  speedSourceMode: 'AUTO' | 'OBD' | 'GPS'
  mediaTickerEnabled: boolean
  startupAnimationEnabled: boolean
}

export const VEHICLE_PRESETS: VehicleProfile[] = [
  {
    id: 'jzx100',
    nickname: 'JZX100 MARK II',
    manufacturer: 'Toyota',
    model: 'Mark II JZX100',
    year: 1997,
    engine: '1JZ-GTE',
    fuelType: 'Petrol',
    redlineRpm: 7000,
    speedUnit: 'KPH',
    tempUnit: 'C',
  },
  {
    id: 'evo9',
    nickname: 'EVO IX',
    manufacturer: 'Mitsubishi',
    model: 'Lancer Evolution IX',
    year: 2005,
    engine: '4G63T',
    fuelType: 'Petrol',
    redlineRpm: 7500,
    speedUnit: 'KPH',
    tempUnit: 'C',
  },
  {
    id: 'gc8sti',
    nickname: 'GC8 STI',
    manufacturer: 'Subaru',
    model: 'Impreza WRX STI',
    year: 1999,
    engine: 'EJ207',
    fuelType: 'Petrol',
    redlineRpm: 8000,
    speedUnit: 'KPH',
    tempUnit: 'C',
  },
  {
    id: 'e36',
    nickname: 'E36 328i',
    manufacturer: 'BMW',
    model: '328i E36',
    year: 1996,
    engine: 'M52B28',
    fuelType: 'Petrol',
    redlineRpm: 6500,
    speedUnit: 'KPH',
    tempUnit: 'C',
  },
  {
    id: 'mx5',
    nickname: 'MX-5 MIATA',
    manufacturer: 'Mazda',
    model: 'MX-5 NA',
    year: 1999,
    engine: 'B6-ZE',
    fuelType: 'Petrol',
    redlineRpm: 7200,
    speedUnit: 'KPH',
    tempUnit: 'C',
  },
  {
    id: 'generic',
    nickname: 'GENERIC OBD-II',
    manufacturer: 'Generic',
    model: 'CAN OBD-II Vehicle',
    year: 2000,
    engine: 'Unknown',
    fuelType: 'Petrol',
    redlineRpm: 7000,
    speedUnit: 'KPH',
    tempUnit: 'C',
  },
]
