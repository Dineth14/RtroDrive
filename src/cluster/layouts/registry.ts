import type { ComponentType } from 'react'
import type { ClusterLayoutId } from '@/types/vehicle'
import { JdmDigital86 } from './JdmDigital86'
import { EuroDigital89 } from './EuroDigital89'
import { JdmGt93 } from './JdmGt93'
import { Touring96 } from './Touring96'
import { ClassicElectronic } from './ClassicElectronic'
import { CrtElectronic } from './CrtElectronic'
import { ClassicRoadster60, GrandTouring62, MiniHeritage, VintageTourer, Expedition60 } from './ClassicLayouts'
import { RallyRaid90 } from './RallyRaid90'
import { Utility80 } from './Utility80'
import { Touring95 } from './Touring95'

export const CLUSTER_LAYOUTS: Record<ClusterLayoutId, ComponentType> = {
  CLASSIC_ROADSTER_60: ClassicRoadster60,
  GRAND_TOURING_62: GrandTouring62,
  MINI_HERITAGE: MiniHeritage,
  VINTAGE_TOURER: VintageTourer,
  CRT_ELECTRONIC: CrtElectronic,
  JDM_DIGITAL_86: JdmDigital86,
  EURO_DIGITAL_89: EuroDigital89,
  JDM_GT_93: JdmGt93,
  TOURING_96: Touring96,
  CLASSIC_ELECTRONIC: ClassicElectronic,
  EXPEDITION_60: Expedition60,
  UTILITY_80: Utility80,
  RALLY_RAID_90: RallyRaid90,
  TOURING_95: Touring95,
}

export const CLUSTER_LAYOUT_LABELS: Record<ClusterLayoutId, string> = {
  CLASSIC_ROADSTER_60: 'CLASSIC ROADSTER 60',
  GRAND_TOURING_62: 'GRAND TOURING 62',
  MINI_HERITAGE: 'MINI HERITAGE',
  VINTAGE_TOURER: 'VINTAGE TOURER',
  CRT_ELECTRONIC: 'CRT ELECTRONIC',
  JDM_DIGITAL_86: 'JDM DIGITAL 86',
  EURO_DIGITAL_89: 'EURO DIGITAL 89',
  JDM_GT_93: 'JDM GT 93',
  TOURING_96: 'TOURING 96',
  CLASSIC_ELECTRONIC: 'CLASSIC ELECTRONIC',
  EXPEDITION_60: 'EXPEDITION 60',
  UTILITY_80: 'UTILITY 80',
  RALLY_RAID_90: 'RALLY RAID 90',
  TOURING_95: 'TOURING 95',
}
