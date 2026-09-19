import type { ThemeName } from '@/types/vehicle'

export interface ClusterThemeColors {
  background: string
  panel: string
  panelAlt: string
  primary: string
  primaryBright: string
  primaryDim: string
  amber: string
  warningAmber: string
  criticalRed: string
  mutedText: string
  gridLine: string
}

export const CLUSTER_THEMES: Record<ThemeName, ClusterThemeColors> = {
  HERITAGE_IVORY: {
    background: '#14231e', panel: '#17251f', panelAlt: '#202a23', primary: '#d5cbb0', primaryBright: '#f3e6c8', primaryDim: '#777d64', amber: '#c49d57', warningAmber: '#dfa855', criticalRed: '#cf5345', mutedText: '#9a9f89', gridLine: '#3c493b',
  },
  JDM_PHOSPHOR: {
    background: '#050906',
    panel: '#07100A',
    panelAlt: '#0A1710',
    primary: '#8FCB83',
    primaryBright: '#B6E5A8',
    primaryDim: '#456B45',
    amber: '#D7A94A',
    warningAmber: '#E0A33A',
    criticalRed: '#D84A3A',
    mutedText: '#69806B',
    gridLine: '#243827',
  },
  JDM_AMBER: {
    background: '#0A0704',
    panel: '#120D07',
    panelAlt: '#180F08',
    primary: '#D7A94A',
    primaryBright: '#F0C97A',
    primaryDim: '#7A5F2C',
    amber: '#D7A94A',
    warningAmber: '#E0A33A',
    criticalRed: '#D84A3A',
    mutedText: '#8A7654',
    gridLine: '#3A2E18',
  },
  EURO_GREEN: {
    background: '#04070A',
    panel: '#080F14',
    panelAlt: '#0B141C',
    primary: '#7FC7C9',
    primaryBright: '#AEE6E8',
    primaryDim: '#3E6668',
    amber: '#D7A94A',
    warningAmber: '#E0A33A',
    criticalRed: '#D84A3A',
    mutedText: '#5E7B7C',
    gridLine: '#1E3336',
  },
  MONO_LCD: {
    background: '#0A0A08',
    panel: '#101008',
    panelAlt: '#161610',
    primary: '#C8C8B0',
    primaryBright: '#F0F0DC',
    primaryDim: '#6A6A58',
    amber: '#D7A94A',
    warningAmber: '#E0A33A',
    criticalRed: '#D84A3A',
    mutedText: '#7A7A68',
    gridLine: '#2A2A20',
  },
}

export function applyClusterTheme(theme: ThemeName, target: HTMLElement) {
  const colors = CLUSTER_THEMES[theme]
  for (const [key, value] of Object.entries(colors)) {
    target.style.setProperty(`--cl-${camelToKebab(key)}`, value)
  }
}

function camelToKebab(s: string) {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}
