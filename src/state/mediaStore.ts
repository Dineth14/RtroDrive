import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MediaVisualStyle, Track, VisualizerMode } from '@/types/media'

export const TRACKS: Track[] = [
  { id: 't1', title: 'MIDNIGHT EXPRESS', artist: 'Neon Avenue', durationSeconds: 214 },
  { id: 't2', title: 'CITY AFTER RAIN', artist: 'Signal Drive', durationSeconds: 198 },
  { id: 't3', title: 'NIGHT RUN', artist: 'Static Motion', durationSeconds: 231 },
  { id: 't4', title: 'REAR VIEW MIRROR', artist: 'Ghost Radio', durationSeconds: 187 },
  { id: 't5', title: 'LAST TOLL BOOTH', artist: 'Vector Sunset', durationSeconds: 246 },
]

export const SPECTRUM_BAND_LABELS = ['63', '125', '250', '500', '1K', '2K', '4K', '8K', '16K', '20K', '22K', '24K']
const BAND_COUNT = SPECTRUM_BAND_LABELS.length

let bandTargets = new Array(BAND_COUNT).fill(0.1)
let bandRetarget = new Array(BAND_COUNT).fill(0)

interface MediaStoreState {
  ducked: boolean
  setDucked: (value: boolean) => void
  isPlaying: boolean
  currentTrackId: string
  elapsedSeconds: number
  bluetoothConnected: boolean
  visualStyle: MediaVisualStyle
  visualizerMode: VisualizerMode
  levels: number[]

  play: () => void
  pause: () => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  tick: (dtSeconds: number) => void
  setVisualStyle: (style: MediaVisualStyle) => void
  setVisualizerMode: (mode: VisualizerMode) => void
  setBluetoothConnected: (v: boolean) => void
  currentTrack: () => Track
}

export const useMediaStore = create<MediaStoreState>()(persist((set, get) => ({
  ducked: false,
  setDucked: value=>set({ducked:value}),
  isPlaying: false,
  currentTrackId: TRACKS[0].id,
  elapsedSeconds: 0,
  bluetoothConnected: true,
  visualStyle: 'GRAPHIC_EQ_91',
  visualizerMode: 'SPECTRUM',
  levels: new Array(BAND_COUNT).fill(0.08),

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
    if (!s.isPlaying) {
      if (s.levels.some((l) => l > 0.09)) {
        set({ levels: s.levels.map((l) => Math.max(0.08, l - dtSeconds * 0.6)) })
      }
      return
    }
    const track = TRACKS.find((t) => t.id === s.currentTrackId) ?? TRACKS[0]
    const elapsed = s.elapsedSeconds + dtSeconds
    if (elapsed >= track.durationSeconds) {
      get().next()
      return
    }

    // Correlated pseudo-FFT: each band occasionally re-targets influenced by
    // its neighbours, then the visible level eases toward the target with a
    // fast attack / slower decay so motion reads as music, not noise.
    const nextLevels = s.levels.slice()
    for (let i = 0; i < BAND_COUNT; i++) {
      bandRetarget[i] -= dtSeconds
      if (bandRetarget[i] <= 0) {
        bandRetarget[i] = 0.12 + Math.random() * 0.3
        const neighbour = bandTargets[Math.max(0, i - 1)]
        const bias = i < 3 ? 0.55 : i < 8 ? 0.4 : 0.25
        bandTargets[i] = Math.min(1, Math.max(0.06, neighbour * 0.4 + Math.random() * bias + 0.08))
      }
      const target = bandTargets[i] * (s.ducked ? .15 : 1)
      const rate = target > nextLevels[i] ? 9 : 2.6
      nextLevels[i] = nextLevels[i] + (target - nextLevels[i]) * Math.min(1, rate * dtSeconds)
    }

    set({ elapsedSeconds: elapsed, levels: nextLevels })
  },
  setVisualStyle: (style) => set({ visualStyle: style }),
  setVisualizerMode: (mode) => set({ visualizerMode: mode }),
  setBluetoothConnected: (v) => set({ bluetoothConnected: v }),
  currentTrack: () => TRACKS.find((t) => t.id === get().currentTrackId) ?? TRACKS[0],
}), { name: 'retrodrive-media', partialize: s=>({visualStyle:s.visualStyle,visualizerMode:s.visualizerMode,currentTrackId:s.currentTrackId}) }))
