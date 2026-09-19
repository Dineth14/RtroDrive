import { useState } from 'react'
import { Bluetooth, Play, Pause, SkipBack, SkipForward, Folder } from 'lucide-react'
import { useMediaStore, TRACKS, SPECTRUM_BAND_LABELS } from '@/state/mediaStore'
import type { VisualizerMode } from '@/types/media'
import './MediaScreen.css'

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function SpectrumBars({ levels, segments = 9 }: { levels: number[]; segments?: number }) {
  return (
    <div className="rd-eq-bars">
      {levels.map((lvl, i) => {
        const lit = Math.round(lvl * segments)
        return (
          <div className="rd-eq-bar-col" key={i}>
            <div className="rd-eq-bar-track">
              {Array.from({ length: segments }).map((_, s) => {
                const isLit = s < lit
                const fromTop = segments - 1 - s
                const color = fromTop < 2 ? 'var(--cl-critical-red)' : fromTop < 4 ? 'var(--cl-warning-amber)' : 'var(--cl-primary)'
                return <div key={s} className="rd-eq-bar-seg" style={isLit ? { background: color, boxShadow: `0 0 3px ${color}` } : undefined} />
              })}
            </div>
            <span className="rd-eq-bar-freq">{SPECTRUM_BAND_LABELS[i]}</span>
          </div>
        )
      })}
    </div>
  )
}

function VuMeter({ levels }: { levels: number[] }) {
  const left = levels.slice(0, 6).reduce((a, b) => a + b, 0) / 6
  const right = levels.slice(6).reduce((a, b) => a + b, 0) / 6
  return (
    <div style={{ display: 'flex', gap: 40, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'flex-end', paddingTop: 10 }}>
      {[['L', left], ['R', right]].map(([label, val]) => (
        <div key={label as string} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
          <div className="rd-eq-bar-track" style={{ width: 60 }}>
            {Array.from({ length: 14 }).map((_, s) => {
              const lit = s < Math.round((val as number) * 14)
              const fromTop = 13 - s
              const color = fromTop < 2 ? 'var(--cl-critical-red)' : fromTop < 5 ? 'var(--cl-warning-amber)' : 'var(--cl-primary)'
              return <div key={s} className="rd-eq-bar-seg" style={{ height: 10, ...(lit ? { background: color, boxShadow: `0 0 4px ${color}` } : {}) }} />
            })}
          </div>
          <span className="rd-eq-bar-freq">{label}</span>
        </div>
      ))}
    </div>
  )
}

function WaveForm({ levels }: { levels: number[] }) {
  const w = 400
  const h = 140
  const pts = levels.map((l, i) => {
    const x = (i / (levels.length - 1)) * w
    const y = h / 2 - (l - 0.3) * h * 0.8
    return `${x},${y}`
  })
  return (
    <svg className="rd-eq-wave-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke="var(--cl-grid-line)" strokeWidth={1} />
      <polyline points={pts.join(' ')} fill="none" stroke="var(--cl-primary)" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 3px var(--cl-primary))' }} />
    </svg>
  )
}

function DotMatrix({ levels }: { levels: number[] }) {
  const cols = 28
  const rows = 7
  return (
    <div className="rd-eq-dotmatrix">
      {Array.from({ length: cols * rows }).map((_, idx) => {
        const col = idx % cols
        const row = rows - 1 - Math.floor(idx / cols)
        const band = Math.floor((col / cols) * levels.length)
        const lit = row < Math.round(levels[band] * rows)
        const color = row >= rows - 2 ? 'var(--cl-critical-red)' : row >= rows - 4 ? 'var(--cl-warning-amber)' : 'var(--cl-primary)'
        return <div key={idx} className="rd-eq-dot" style={lit ? { background: color, boxShadow: `0 0 2px ${color}` } : undefined} />
      })}
    </div>
  )
}

export function MediaScreen() {
  const isPlaying = useMediaStore((s) => s.isPlaying)
  const elapsed = useMediaStore((s) => s.elapsedSeconds)
  const bluetoothConnected = useMediaStore((s) => s.bluetoothConnected)
  const visualStyle = useMediaStore((s) => s.visualStyle)
  const visualizerMode = useMediaStore((s) => s.visualizerMode)
  const levels = useMediaStore((s) => s.levels)
  const currentTrackId = useMediaStore((s) => s.currentTrackId)
  const togglePlay = useMediaStore((s) => s.togglePlay)
  const next = useMediaStore((s) => s.next)
  const previous = useMediaStore((s) => s.previous)
  const setVisualStyle = useMediaStore((s) => s.setVisualStyle)
  const setVisualizerMode = useMediaStore((s) => s.setVisualizerMode)

  const [cassetteModes, setCassetteModes] = useState({ metal: true, nr: true, ams: false, rpt: false })
  const [cdModes, setCdModes] = useState({ rpt: false, eq: true, rdm: false })
  const [dspMode, setDspMode] = useState<'NORMAL' | 'LIVE' | 'HALL'>('NORMAL')

  const track = TRACKS.find((t) => t.id === currentTrackId) ?? TRACKS[0]
  const trackIndex = TRACKS.findIndex((t) => t.id === currentTrackId) + 1
  const progress = Math.min(1, elapsed / track.durationSeconds)
  const remaining = Math.max(0, track.durationSeconds - elapsed)

  const progressBlocks = (() => {
    const total = 10
    const filled = Math.round(progress * total)
    return '#'.repeat(filled) + '-'.repeat(total - filled)
  })()

  return (
    <div className="rd-screen">
      <div className="rd-media">
        <div className="rd-media-topline">
          <span>RETRODRIVE AUDIO</span>
          <span className="rd-media-bt" style={{ color: bluetoothConnected ? 'var(--cl-primary)' : 'var(--cl-muted-text)' }}>
            <Bluetooth size={13} /> {bluetoothConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>

        <div className="rd-media-stage">
          {visualStyle === 'CASSETTE_86' && (
            <>
              <div className="rd-cassette-head">
                <span>AUTO REVERSE</span>
                <span>TAPE A</span>
                <span>DOLBY B</span>
              </div>
              <div className="rd-cassette-body">
                <div className="rd-cassette-deck">
                  <div className={`rd-cassette-reel${isPlaying ? ' spin' : ''}`} />
                  <div className="rd-cassette-track">
                    <div className="rd-cassette-title">{isPlaying ? '▶  ' : '❚❚  '}{track.title}</div>
                    <div className="rd-cassette-artist">{track.artist}</div>
                  </div>
                  <div className={`rd-cassette-reel${isPlaying ? ' spin' : ''}`} />
                </div>
                <div className="rd-cassette-blocks tabular-num">
                  {formatTime(elapsed)} &nbsp; {progressBlocks} &nbsp; {formatTime(track.durationSeconds)}
                </div>
              </div>
              <div className="rd-cassette-modes">
                {(['metal', 'nr', 'ams', 'rpt'] as const).map((m) => (
                  <span
                    key={m}
                    className={`rd-cassette-mode${cassetteModes[m] ? ' on' : ''}`}
                    onClick={() => setCassetteModes((s) => ({ ...s, [m]: !s[m] }))}
                    style={{ cursor: 'pointer' }}
                  >
                    {m.toUpperCase()}
                  </span>
                ))}
              </div>
            </>
          )}

          {visualStyle === 'GRAPHIC_EQ_91' && (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ flex: 1 }}>
                {visualizerMode === 'SPECTRUM' && <SpectrumBars levels={levels} />}
                {visualizerMode === 'VU_METER' && <VuMeter levels={levels} />}
                {visualizerMode === 'WAVE' && <WaveForm levels={levels} />}
                {visualizerMode === 'DOT_MATRIX' && <DotMatrix levels={levels} />}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 16, color: 'var(--cl-primary-bright)' }}>{track.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--cl-muted-text)', letterSpacing: 1 }}>{track.artist}</div>
                </div>
                <div className="rd-media-styles">
                  {(['SPECTRUM', 'VU_METER', 'WAVE', 'DOT_MATRIX'] as VisualizerMode[]).map((m) => (
                    <button key={m} className={`rd-media-style-btn${visualizerMode === m ? ' active' : ''}`} onClick={() => setVisualizerMode(m)}>
                      {m.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {visualStyle === 'CD_94' && (
            <div className="rd-cd-body">
              <div className={`rd-cd-disc${isPlaying ? ' spin' : ''}`} />
              <div className="rd-cd-info">
                <div className="rd-cd-tracknum">
                  DISC 01 &nbsp; TRACK {String(trackIndex).padStart(2, '0')}
                </div>
                <div className="rd-cd-time tabular-num">{formatTime(elapsed)}</div>
                <div className="rd-cd-title">{track.title}</div>
                <div className="rd-cd-artist">{track.artist}</div>
                <div className="rd-cd-modes">
                  {(['rpt', 'eq', 'rdm'] as const).map((m) => (
                    <span
                      key={m}
                      style={{ cursor: 'pointer', color: cdModes[m] ? 'var(--cl-amber)' : 'var(--cl-grid-line)' }}
                      onClick={() => setCdModes((s) => ({ ...s, [m]: !s[m] }))}
                    >
                      {m.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {visualStyle === 'MINIDISC_98' && (
            <div className="rd-md-body">
              <div className="rd-md-toprow">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Folder size={13} /> GROUP 01 / TRACK {String(trackIndex).padStart(2, '0')}
                </span>
                <span onClick={() => setDspMode((m) => (m === 'NORMAL' ? 'LIVE' : m === 'LIVE' ? 'HALL' : 'NORMAL'))} style={{ cursor: 'pointer', color: 'var(--cl-amber)' }}>
                  DSP: {dspMode}
                </span>
                <span>-{formatTime(remaining)}</span>
              </div>
              <div className="rd-md-marquee-track">
                <span className="rd-md-marquee-text">
                  {track.title} — {track.artist} &nbsp;&nbsp;&nbsp;&nbsp; {track.title} — {track.artist} &nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </div>
              <div className="rd-md-mini-spectrum">
                {levels.slice(0, 16).map((l, i) => (
                  <div key={i} className="rd-md-mini-bar" style={{ height: `${Math.max(6, l * 100)}%` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rd-media-footer">
          <div className="rd-media-progress-row">
            <span className="tabular-num">{formatTime(elapsed)}</span>
            <div className="rd-media-progress-track">
              <div className="rd-media-progress-fill" style={{ width: `${progress * 100}%` }} />
            </div>
            <span className="tabular-num">{formatTime(track.durationSeconds)}</span>
          </div>
          <div className="rd-media-controlrow">
            <div className="rd-media-controls">
              <button className="rd-media-btn" onClick={previous} aria-label="Previous">
                <SkipBack size={16} />
              </button>
              <button className="rd-media-btn play" onClick={togglePlay} aria-label="Play/Pause">
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button className="rd-media-btn" onClick={next} aria-label="Next">
                <SkipForward size={16} />
              </button>
            </div>
            <div className="rd-media-styles">
              {([
                ['CASSETTE_86', '86'],
                ['GRAPHIC_EQ_91', '91'],
                ['CD_94', '94'],
                ['MINIDISC_98', '98'],
              ] as const).map(([style, yr]) => (
                <button key={style} className={`rd-media-style-btn${style === visualStyle ? ' active' : ''}`} onClick={() => setVisualStyle(style)}>
                  {yr}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
