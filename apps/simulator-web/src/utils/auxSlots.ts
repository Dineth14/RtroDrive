import type { AuxSlotValue, VehicleProfile } from '@/types/vehicle'
import type { TelemetrySnapshot } from '@/types/telemetry'

export interface ResolvedAux {
  key: AuxSlotValue
  label: string
  value: number
  unit: string
  available: boolean
  decimals: number
}

interface AuxMeta {
  label: string
  unit: string
  decimals: number
  get: (t: TelemetrySnapshot) => { value: number; available: boolean }
}

const AUX_META: Record<AuxSlotValue, AuxMeta> = {
  BOOST: { label: 'BOOST', unit: 'bar', decimals: 2, get: (t) => ({ value: t.boostBar.value, available: t.boostBar.available }) },
  OIL_PRESSURE: { label: 'OIL P', unit: 'bar', decimals: 1, get: (t) => ({ value: t.oilPressureBar.value, available: t.oilPressureBar.available }) },
  OIL_TEMP: { label: 'OIL T', unit: '°C', decimals: 0, get: (t) => ({ value: t.oilTempC.value, available: t.oilTempC.available }) },
  COOLANT: { label: 'WATER', unit: '°C', decimals: 0, get: (t) => ({ value: t.coolantTempC.value, available: t.coolantTempC.available }) },
  IAT: { label: 'IAT', unit: '°C', decimals: 0, get: (t) => ({ value: t.intakeTempC.value, available: t.intakeTempC.available }) },
  BATTERY: { label: 'VOLT', unit: 'V', decimals: 1, get: (t) => ({ value: t.batteryVoltage.value, available: t.batteryVoltage.available }) },
  FUEL: { label: 'FUEL', unit: '%', decimals: 0, get: (t) => ({ value: t.fuelPercent.value, available: t.fuelPercent.available }) },
  ENGINE_LOAD: { label: 'LOAD', unit: '%', decimals: 0, get: (t) => ({ value: t.engineLoadPercent.value, available: t.engineLoadPercent.available }) },
  MAP: { label: 'MAP', unit: 'kPa', decimals: 0, get: (t) => ({ value: t.mapKpa.value, available: t.mapKpa.available }) },
  MAF: { label: 'MAF', unit: 'g/s', decimals: 1, get: (t) => ({ value: t.mafGps.value, available: t.mafGps.available }) },
  STFT: { label: 'STFT', unit: '%', decimals: 0, get: (t) => ({ value: t.shortFuelTrimPercent.value, available: t.shortFuelTrimPercent.available }) },
  LTFT: { label: 'LTFT', unit: '%', decimals: 0, get: (t) => ({ value: t.longFuelTrimPercent.value, available: t.longFuelTrimPercent.available }) },
}

/**
 * Resolves an aux-slot preference to an actually-displayable channel.
 * BOOST silently substitutes to the next most useful channel on NA vehicles
 * or when boost data is unavailable, per the "source-aware gauges" rule —
 * the cluster should never show a permanent "-- bar" placeholder.
 */
export function resolveAuxSlot(key: AuxSlotValue, telemetry: TelemetrySnapshot, vehicle: VehicleProfile): ResolvedAux {
  let resolved = key

  if (resolved === 'BOOST' && !vehicle.isTurbocharged) {
    resolved = telemetry.oilTempC.available ? 'OIL_TEMP' : telemetry.engineLoadPercent.available ? 'ENGINE_LOAD' : 'BATTERY'
  }
  if (resolved === 'OIL_PRESSURE' && !telemetry.oilPressureBar.available) {
    resolved = vehicle.isTurbocharged && telemetry.boostBar.available ? 'BOOST' : 'OIL_TEMP'
  }

  let meta = AUX_META[resolved]
  let sample = meta.get(telemetry)
  if (!sample.available) {
    const fallbackOrder: AuxSlotValue[] = ['OIL_TEMP', 'BATTERY', 'IAT', 'ENGINE_LOAD']
    for (const fb of fallbackOrder) {
      const fbSample = AUX_META[fb].get(telemetry)
      if (fbSample.available) {
        resolved = fb
        meta = AUX_META[fb]
        sample = fbSample
        break
      }
    }
  }

  return { key: resolved, label: meta.label, unit: meta.unit, decimals: meta.decimals, value: sample.value, available: sample.available }
}

export const AUX_SLOT_OPTIONS: AuxSlotValue[] = [
  'BOOST',
  'OIL_PRESSURE',
  'OIL_TEMP',
  'COOLANT',
  'IAT',
  'BATTERY',
  'FUEL',
  'ENGINE_LOAD',
  'MAP',
  'MAF',
  'STFT',
  'LTFT',
]
