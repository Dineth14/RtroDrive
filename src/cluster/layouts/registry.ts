import type { ComponentType } from 'react'
import type { ClusterLayoutId } from '@/types/vehicle'
import { JdmDigital86 } from './JdmDigital86'
import { EuroDigital89 } from './EuroDigital89'
import { JdmGt93 } from './JdmGt93'
import { Touring96 } from './Touring96'
import { ClassicElectronic } from './ClassicElectronic'

export const CLUSTER_LAYOUTS: Record<ClusterLayoutId, ComponentType> = {
  JDM_DIGITAL_86: JdmDigital86,
  EURO_DIGITAL_89: EuroDigital89,
  JDM_GT_93: JdmGt93,
  TOURING_96: Touring96,
  CLASSIC_ELECTRONIC: ClassicElectronic,
}

export const CLUSTER_LAYOUT_LABELS: Record<ClusterLayoutId, string> = {
  JDM_DIGITAL_86: 'JDM DIGITAL 86',
  EURO_DIGITAL_89: 'EURO DIGITAL 89',
  JDM_GT_93: 'JDM GT 93',
  TOURING_96: 'TOURING 96',
  CLASSIC_ELECTRONIC: 'CLASSIC ELECTRONIC',
}
