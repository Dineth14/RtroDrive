import type { ClusterLayoutId, ThemeName, VehicleCategory, VehicleProfile } from '@/types/vehicle'
import type { MediaVisualStyle } from '@/types/media'
export type VisualEra = 'CLASSIC_60' | 'DIGITAL_80' | 'PERFORMANCE_90'
export type VisualFamily = 'CLASSIC_ANALOGUE' | 'DIGITAL_80S' | 'PERFORMANCE_90S' | 'EXPEDITION_RETRO'
export type ArtworkId = 'sedan' | 'coupe' | 'evo' | 'rally' | 'mini' | 'offroad' | 'roadster' | 'utility4x4' | 'rallysuv'
export type NavigationThemeId = 'ARCADE_86' | 'CRT_91' | 'GT_97' | 'EXPEDITION_TRAIL' | 'RALLY_ROADBOOK'
export interface VehicleVisualProfile {
  id: string; name: string; era: VisualEra
  family: VisualFamily
  category: VehicleCategory
  defaultClusterTheme: ClusterLayoutId; defaultMediaTheme: MediaVisualStyle
  defaultNavigationTheme: NavigationThemeId; bootAnimation: 'TRACE' | 'IGNITION'
  carArtwork: ArtworkId; palette: ThemeName
  typography: 'TECHNICAL' | 'INSTRUMENT'; gaugeStyle: 'SEGMENT' | 'NEEDLE' | 'DIAGONAL'
  animationStyle: 'PHOSPHOR' | 'DAMPED'; turboBehavior: 'SPOOL' | 'NONE'
  dashboardDensity: 'DENSE' | 'BALANCED'
  supportsOffRoadMode: boolean
  supportsExpeditionMode: boolean
}
function profile(id: string, name: string, era: VisualEra, layout: ClusterLayoutId, art: ArtworkId, category: VehicleCategory, turbo = false): VehicleVisualProfile {
  const classic = era === 'CLASSIC_60'
  return { id, name, era, family: classic ? 'CLASSIC_ANALOGUE' : era === 'DIGITAL_80' ? 'DIGITAL_80S' : 'PERFORMANCE_90S', category, defaultClusterTheme: layout,
    defaultMediaTheme: classic ? 'HERITAGE_RADIO' : era === 'DIGITAL_80' ? 'CASSETTE_86' : 'EQ_DECK_89',
    defaultNavigationTheme: classic ? 'RALLY_ROADBOOK' : era === 'DIGITAL_80' ? 'ARCADE_86' : 'GT_97',
    bootAnimation: classic ? 'IGNITION' : 'TRACE', carArtwork: art,
    palette: classic ? 'HERITAGE_IVORY' : 'JDM_PHOSPHOR', typography: classic ? 'INSTRUMENT' : 'TECHNICAL',
    gaugeStyle: classic ? 'NEEDLE' : era === 'DIGITAL_80' ? 'SEGMENT' : 'DIAGONAL', animationStyle: classic ? 'DAMPED' : 'PHOSPHOR',
    turboBehavior: turbo ? 'SPOOL' : 'NONE', dashboardDensity: classic ? 'BALANCED' : 'DENSE',
    supportsOffRoadMode: false, supportsExpeditionMode: false }
}
function offroadProfile(id: string, name: string, category: VehicleCategory, layout: ClusterLayoutId, media: MediaVisualStyle, nav: NavigationThemeId, art: ArtworkId, opts: { classic?: boolean; turbo?: boolean; palette?: ThemeName } = {}): VehicleVisualProfile {
  const classic = !!opts.classic
  return { id, name, era: classic ? 'CLASSIC_60' : 'PERFORMANCE_90', family: 'EXPEDITION_RETRO', category,
    defaultClusterTheme: layout, defaultMediaTheme: media, defaultNavigationTheme: nav,
    bootAnimation: classic ? 'IGNITION' : 'TRACE', carArtwork: art,
    palette: opts.palette ?? (classic ? 'HERITAGE_IVORY' : 'EURO_GREEN'),
    typography: classic ? 'INSTRUMENT' : 'TECHNICAL', gaugeStyle: classic ? 'NEEDLE' : 'DIAGONAL',
    animationStyle: classic ? 'DAMPED' : 'PHOSPHOR', turboBehavior: opts.turbo ? 'SPOOL' : 'NONE',
    dashboardDensity: classic ? 'BALANCED' : 'DENSE', supportsOffRoadMode: true, supportsExpeditionMode: true }
}
export const VISUAL_PROFILES = {
  JZX100_STYLE: profile('JZX100_STYLE', 'Sports saloon · 1993', 'PERFORMANCE_90', 'JDM_GT_93', 'sedan', 'GT', true),
  AE86_STYLE: profile('AE86_STYLE', 'Lightweight coupe · 1986', 'DIGITAL_80', 'JDM_DIGITAL_86', 'coupe', 'SPORT_COMPACT'),
  EVO_STYLE: profile('EVO_STYLE', 'Rally evolution · 1996', 'PERFORMANCE_90', 'JDM_GT_93', 'evo', 'RALLY', true),
  SUBARU_STI_STYLE: profile('SUBARU_STI_STYLE', 'Rally special · 1998', 'PERFORMANCE_90', 'JDM_GT_93', 'rally', 'RALLY', true),
  CLASSIC_MINI_STYLE: profile('CLASSIC_MINI_STYLE', 'Small car. Great character.', 'CLASSIC_60', 'MINI_HERITAGE', 'mini', 'CLASSIC'),
  GENERIC_1960S_CLASSIC: profile('GENERIC_1960S_CLASSIC', 'The open road · 1960', 'CLASSIC_60', 'CLASSIC_ROADSTER_60', 'roadster', 'CLASSIC'),
  GENERIC_1980S_DIGITAL: profile('GENERIC_1980S_DIGITAL', 'Electronic instruments · 1989', 'DIGITAL_80', 'EURO_DIGITAL_89', 'coupe', 'GT'),
  GENERIC_1990S_GT: profile('GENERIC_1990S_GT', 'Grand touring · 1993', 'PERFORMANCE_90', 'JDM_GT_93', 'sedan', 'GT'),
  LAND_CRUISER_CLASSIC_STYLE: offroadProfile('LAND_CRUISER_CLASSIC_STYLE', 'Expedition instruments · 1980', 'EXPEDITION', 'EXPEDITION_60', 'HERITAGE_RADIO', 'EXPEDITION_TRAIL', 'offroad', { classic: true }),
  LAND_CRUISER_90S_STYLE: offroadProfile('LAND_CRUISER_90S_STYLE', 'Touring 4x4 · 1995', 'UTILITY_4X4', 'TOURING_95', 'CD_TUNER_95', 'GT_97', 'offroad', { palette: 'EURO_GREEN' }),
  DEFENDER_CLASSIC_STYLE: offroadProfile('DEFENDER_CLASSIC_STYLE', 'Utility 4x4 · 1985', 'UTILITY_4X4', 'UTILITY_80', 'EXPEDITION_RECEIVER', 'EXPEDITION_TRAIL', 'utility4x4', { palette: 'EURO_GREEN' }),
  PAJERO_RALLY_STYLE: offroadProfile('PAJERO_RALLY_STYLE', 'Rally raid SUV · 1998', 'RALLY', 'RALLY_RAID_90', 'DSP_RECEIVER_92', 'RALLY_ROADBOOK', 'rallysuv', { turbo: true, palette: 'JDM_AMBER' }),
  GENERIC_CLASSIC_4X4: offroadProfile('GENERIC_CLASSIC_4X4', 'Classic expedition 4x4 · 1975', 'EXPEDITION', 'EXPEDITION_60', 'HERITAGE_RADIO', 'EXPEDITION_TRAIL', 'offroad', { classic: true }),
} satisfies Record<string, VehicleVisualProfile>
const vehicleVisualIds: Record<string, keyof typeof VISUAL_PROFILES> = {
  jzx100: 'JZX100_STYLE', ae86: 'AE86_STYLE', evo6: 'EVO_STYLE', gc8sti: 'SUBARU_STI_STYLE', gdsti: 'SUBARU_STI_STYLE',
  minimpi: 'CLASSIC_MINI_STYLE', classic60: 'GENERIC_1960S_CLASSIC', digital80: 'GENERIC_1980S_DIGITAL', gt90: 'GENERIC_1990S_GT',
  mx5nb: 'GENERIC_1960S_CLASSIC', e46: 'GENERIC_1980S_DIGITAL',
  landcruiser: 'LAND_CRUISER_CLASSIC_STYLE', landcruiser90s: 'LAND_CRUISER_90S_STYLE', defender: 'DEFENDER_CLASSIC_STYLE',
  pajero: 'PAJERO_RALLY_STYLE', classic4x4gen: 'GENERIC_CLASSIC_4X4',
}
export function getVisualProfile(vehicle: VehicleProfile): VehicleVisualProfile {
  return VISUAL_PROFILES[vehicleVisualIds[vehicle.id] ?? 'GENERIC_1990S_GT']
}
export function isClassicLayout(layout: ClusterLayoutId) {
  return ['CLASSIC_ROADSTER_60', 'GRAND_TOURING_62', 'MINI_HERITAGE', 'VINTAGE_TOURER'].includes(layout)
}
export function isOffRoadLayout(layout: ClusterLayoutId) {
  return ['EXPEDITION_60', 'UTILITY_80', 'RALLY_RAID_90', 'TOURING_95'].includes(layout)
}
