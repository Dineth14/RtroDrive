export type MediaVisualStyle = 'CASSETTE_86' | 'GRAPHIC_EQ_91' | 'CD_94' | 'MINIDISC_98' | 'HERITAGE_RADIO'
export type VisualizerMode = 'SPECTRUM' | 'VU_METER' | 'WAVE' | 'DOT_MATRIX'

export interface Track {
  id: string
  title: string
  artist: string
  durationSeconds: number
}
