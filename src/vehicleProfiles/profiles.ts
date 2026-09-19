import type { ClusterLayoutId, ThemeName, VehicleProfile } from '@/types/vehicle'
import type { MediaVisualStyle } from '@/types/media'
export type VisualEra = 'CLASSIC_60' | 'DIGITAL_80' | 'PERFORMANCE_90'
export type ArtworkId = 'sedan' | 'coupe' | 'evo' | 'rally' | 'mini' | 'offroad' | 'roadster'
export interface VehicleVisualProfile {
  id: string; name: string; era: VisualEra
  family: 'RETRO_DIGITAL' | 'CLASSIC_ANALOGUE' | 'TOURING_RETRO'
  defaultClusterTheme: ClusterLayoutId; defaultMediaTheme: MediaVisualStyle
  defaultNavigationTheme: 'CRT' | 'RALLY'; bootAnimation: 'TRACE' | 'IGNITION'
  carArtwork: ArtworkId; palette: ThemeName
  typography: 'TECHNICAL' | 'INSTRUMENT'; gaugeStyle: 'SEGMENT' | 'NEEDLE' | 'DIAGONAL'
  animationStyle: 'PHOSPHOR' | 'DAMPED'; turboBehavior: 'SPOOL' | 'NONE'
  dashboardDensity: 'DENSE' | 'BALANCED'
}
function profile(id: string, name: string, era: VisualEra, layout: ClusterLayoutId, art: ArtworkId, turbo = false): VehicleVisualProfile {
  const classic = era === 'CLASSIC_60'
  return { id, name, era, family: classic ? 'CLASSIC_ANALOGUE' : art === 'offroad' ? 'TOURING_RETRO' : 'RETRO_DIGITAL', defaultClusterTheme: layout,
    defaultMediaTheme: classic ? 'HERITAGE_RADIO' : era === 'DIGITAL_80' ? 'CASSETTE_86' : 'GRAPHIC_EQ_91',
    defaultNavigationTheme: classic ? 'RALLY' : 'CRT', bootAnimation: classic ? 'IGNITION' : 'TRACE', carArtwork: art,
    palette: classic ? 'HERITAGE_IVORY' : 'JDM_PHOSPHOR', typography: classic ? 'INSTRUMENT' : 'TECHNICAL',
    gaugeStyle: classic ? 'NEEDLE' : era === 'DIGITAL_80' ? 'SEGMENT' : 'DIAGONAL', animationStyle: classic ? 'DAMPED' : 'PHOSPHOR',
    turboBehavior: turbo ? 'SPOOL' : 'NONE', dashboardDensity: classic ? 'BALANCED' : 'DENSE' }
}
export const VISUAL_PROFILES = {
  JZX100_STYLE: profile('JZX100_STYLE', 'Sports saloon · 1993', 'PERFORMANCE_90', 'JDM_GT_93', 'sedan', true),
  AE86_STYLE: profile('AE86_STYLE', 'Lightweight coupe · 1986', 'DIGITAL_80', 'JDM_DIGITAL_86', 'coupe'),
  EVO_STYLE: profile('EVO_STYLE', 'Rally evolution · 1996', 'PERFORMANCE_90', 'JDM_GT_93', 'evo', true),
  SUBARU_STI_STYLE: profile('SUBARU_STI_STYLE', 'Rally special · 1998', 'PERFORMANCE_90', 'JDM_GT_93', 'rally', true),
  CLASSIC_MINI_STYLE: profile('CLASSIC_MINI_STYLE', 'Small car. Great character.', 'CLASSIC_60', 'MINI_HERITAGE', 'mini'),
  LAND_CRUISER_STYLE: profile('LAND_CRUISER_STYLE', 'Expedition instruments', 'CLASSIC_60', 'VINTAGE_TOURER', 'offroad'),
  GENERIC_1960S_CLASSIC: profile('GENERIC_1960S_CLASSIC', 'The open road · 1960', 'CLASSIC_60', 'CLASSIC_ROADSTER_60', 'roadster'),
  GENERIC_1980S_DIGITAL: profile('GENERIC_1980S_DIGITAL', 'Electronic instruments · 1989', 'DIGITAL_80', 'EURO_DIGITAL_89', 'coupe'),
  GENERIC_1990S_GT: profile('GENERIC_1990S_GT', 'Grand touring · 1993', 'PERFORMANCE_90', 'JDM_GT_93', 'sedan'),
} satisfies Record<string, VehicleVisualProfile>
const vehicleVisualIds: Record<string, keyof typeof VISUAL_PROFILES> = { jzx100: 'JZX100_STYLE', ae86: 'AE86_STYLE', evo6: 'EVO_STYLE', gc8sti: 'SUBARU_STI_STYLE', gdsti: 'SUBARU_STI_STYLE', minimpi: 'CLASSIC_MINI_STYLE', landcruiser: 'LAND_CRUISER_STYLE', classic60: 'GENERIC_1960S_CLASSIC', digital80: 'GENERIC_1980S_DIGITAL', gt90: 'GENERIC_1990S_GT', mx5nb: 'GENERIC_1960S_CLASSIC', e46: 'GENERIC_1980S_DIGITAL' }
export function getVisualProfile(vehicle: VehicleProfile): VehicleVisualProfile {
  return VISUAL_PROFILES[vehicleVisualIds[vehicle.id] ?? 'GENERIC_1990S_GT']
}
export function isClassicLayout(layout: ClusterLayoutId) {
  return ['CLASSIC_ROADSTER_60', 'GRAND_TOURING_62', 'MINI_HERITAGE', 'VINTAGE_TOURER'].includes(layout)
}
