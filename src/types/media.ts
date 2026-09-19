export type MediaVisualStyle = 'CASSETTE_86' | 'CD_92' | 'MINIDISC_97'

export interface Track {
  id: string
  title: string
  artist: string
  durationSeconds: number
}

export interface MediaState {
  isPlaying: boolean
  currentTrackId: string
  elapsedSeconds: number
  bluetoothConnected: boolean
  visualStyle: MediaVisualStyle
  volume: number
}
