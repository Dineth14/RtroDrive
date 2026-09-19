import { create } from 'zustand'
import type { MediaVisualStyle, Track } from '@/types/media'

export const TRACKS: Track[] = [
  { id: 't1', title: 'MIDNIGHT EXPRESS', artist: 'Neon Avenue', durationSeconds: 214 },
  { id: 't2', title: 'CITY AFTER RAIN', artist: 'Signal Drive', durationSeconds: 198 },
  { id: 't3', title: 'NIGHT RUN', artist: 'Static Motion', durationSeconds: 231 },
  { id: 't4', title: 'REAR VIEW MIRROR', artist: 'Ghost Radio', durationSeconds: 187 },
  { id: 't5', title: 'LAST TOLL BOOTH', artist: 'Vector Sunset', durationSeconds: 246 },
]

interface MediaStoreState {
  isPlaying: boolean
  currentTrackId: string
  elapsedSeconds: number
  bluetoothConnected: boolean
  visualStyle: MediaVisualStyle
  levels: number[]

  play: () => void
  pause: () => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  tick: (dtSeconds: number) => void
  setVisualStyle: (style: MediaVisualStyle) => void
  setBluetoothConnected: (v: boolean) => void
  currentTrack: () => Track
}

export const useMediaStore = create<MediaStoreState>((set, get) => ({
  isPlaying: false,
  currentTrackId: TRACKS[0].id,
  elapsedSeconds: 0,
  bluetoothConnected: true,
  visualStyle: 'CASSETTE_86',
  levels: new Array(16).fill(0.1),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  next: () => {
    const idx = TRACKS.findIndex((t) => t.id === get().currentTrackId)
    const nextTrack = TRACKS[(idx + 1) % TRACKS.length]
    set({ currentTrackId: nextTrack.id, elapsedSeconds: 0 })
  },
  previous: () => {
    const idx = TRACKS.findIndex((t) => t.id === get().currentTrackId)
    const prevTrack = TRACKS[(idx - 1 + TRACKS.length) % TRACKS.length]
    set({ currentTrackId: prevTrack.id, elapsedSeconds: 0 })
  },
  tick: (dtSeconds) => {
    const s = get()
    if (!s.isPlaying) return
    const track = TRACKS.find((t) => t.id === s.currentTrackId) ?? TRACKS[0]
    let elapsed = s.elapsedSeconds + dtSeconds
    if (elapsed >= track.durationSeconds) {
      get().next()
      return
    }
    const levels = s.levels.map(() => 0.08 + Math.random() * 0.92)
    set({ elapsedSeconds: elapsed, levels })
  },
  setVisualStyle: (style) => set({ visualStyle: style }),
  setBluetoothConnected: (v) => set({ bluetoothConnected: v }),
  currentTrack: () => TRACKS.find((t) => t.id === get().currentTrackId) ?? TRACKS[0],
}))
