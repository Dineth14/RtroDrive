export type MediaVisualStyle = 'CASSETTE_86' | 'EQ_DECK_89' | 'DSP_RECEIVER_92' | 'CD_TUNER_95' | 'MD_DOT_MATRIX_98' | 'HERITAGE_RADIO' | 'EXPEDITION_RECEIVER'
export type VisualizerMode = 'SPECTRUM' | 'VU_METER' | 'WAVE' | 'DOT_MATRIX' | 'PEAK_HOLD'

export interface Track {
  id: string
  title: string
  artist: string
  durationSeconds: number
}

export const MEDIA_ANNUNCIATORS: Record<MediaVisualStyle, string[]> = {
  CASSETTE_86: ['METAL', 'NR', 'AMS', 'RPT'],
  EQ_DECK_89: ['LOUD', 'EQ3', 'RPT', 'AMS', 'DSP', 'AUTO'],
  DSP_RECEIVER_92: ['DSP', 'LOUD', 'ST', 'RPT'],
  CD_TUNER_95: ['RPT', 'RDM', 'SCAN', 'DSP', 'EQ'],
  MD_DOT_MATRIX_98: ['DSP', 'RPT', 'RDM', 'GRP'],
  HERITAGE_RADIO: ['BT', 'ST', 'MONO'],
  EXPEDITION_RECEIVER: ['BT', 'AUX', 'GPS', 'LOUD'],
}
