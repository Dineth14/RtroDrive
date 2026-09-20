import { useState } from 'react'
import { Bluetooth, Play, Pause, SkipBack, SkipForward, Folder } from 'lucide-react'
import { useMediaStore, TRACKS, SPECTRUM_BAND_LABELS } from '@/state/mediaStore'
import type { VisualizerMode } from '@/types/media'
import { MEDIA_ANNUNCIATORS } from '@/types/media'
import './MediaScreen.css'
import { HeritageRadio } from './media/HeritageRadio'
import { DspReceiver92 } from './media/DspReceiver92'
import { ExpeditionReceiver } from './media/ExpeditionReceiver'
import { useVehicleStore } from '@/state/vehicleStore'

export function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function SpectrumBars({ levels, segments = 9 }: { levels: number[]; segments?: number }) {
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

export function PeakHoldBars({ levels, peaks, segments = 9 }: { levels: number[]; peaks: number[]; segments?: number }) {
  return (
    <div className="rd-eq-bars">
      {levels.map((lvl, i) => {
        const lit = Math.round(lvl * segments)
        const peakSeg = Math.min(segments - 1, Math.round(peaks[i] * segments))
        return (
          <div className="rd-eq-bar-col" key={i}>
            <div className="rd-eq-bar-track">
              {Array.from({ length: segments }).map((_, s) => {
                const isLit = s < lit
                const isPeak = s === peakSeg
                const fromTop = segments - 1 - s
                const color = fromTop < 2 ? 'var(--cl-critical-red)' : fromTop < 4 ? 'var(--cl-warning-amber)' : 'var(--cl-primary)'
                if (isPeak) return <div key={s} className="rd-eq-bar-seg rd-eq-peak-seg" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
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

export function VuMeter({ levels }: { levels: number[] }) {
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

export function WaveForm({ levels }: { levels: number[] }) {
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

export function DotMatrix({ levels }: { levels: number[] }) {
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
  const ducked=useMediaStore(s=>s.ducked)
  const driving=useVehicleStore(s=>s.telemetry.speedKph.value>5)
  const isPlaying = useMediaStore((s) => s.isPlaying)
  const elapsed = useMediaStore((s) => s.elapsedSeconds)
  const bluetoothConnected = useMediaStore((s) => s.bluetoothConnected)
  const visualStyle = useMediaStore((s) => s.visualStyle)
  const visualizerMode = useMediaStore((s) => s.visualizerMode)
  const levels = useMediaStore((s) => s.levels)
  const peaks = useMediaStore((s) => s.peaks)
  const currentTrackId = useMediaStore((s) => s.currentTrackId)
  const togglePlay = useMediaStore((s) => s.togglePlay)
  const next = useMediaStore((s) => s.next)
  const previous = useMediaStore((s) => s.previous)
  const setVisualStyle = useMediaStore((s) => s.setVisualStyle)
  const setVisualizerMode = useMediaStore((s) => s.setVisualizerMode)

  const [cassetteModes, setCassetteModes] = useState({ metal: true, nr: true, ams: false, rpt: false })
  const [cdModes, setCdModes] = useState({ rpt: false, eq: true, rdm: false })
  const [dspMode, setDspMode] = useState<'NORMAL' | 'LIVE' | 'HALL'>('NORMAL')
  const [eqAnnunciators, setEqAnnunciators] = useState<Record<string, boolean>>({ LOUD: true, EQ3: true, DSP: false, AUTO: true, RPT: false, AMS: false })

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
      <div className="rd-media" data-style={visualStyle}>
        <div className="rd-media-topline">
          <span>RETRODRIVE AUDIO {ducked?' / ATT · WARNING':''}</span>
          <span className="rd-media-bt" style={{ color: bluetoothConnected ? 'var(--cl-primary)' : 'var(--cl-muted-text)' }}>
            <Bluetooth size={13} /> {bluetoothConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>

        <div className="rd-media-stage">
          {visualStyle === 'HERITAGE_RADIO' && <HeritageRadio/>}
          {visualStyle === 'CASSETTE_86' && (
            <>
              <div className="rd-cassette-head">
                <span>AUTO REVERSE</span>
                <span>TAPE A</span>
                <span>NOISE REDUCTION</span>
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

          {visualStyle === 'EQ_DECK_89' && (
            <div className="rd-eqdeck">
              <div className="rd-eqdeck-topline">
                <span>DSP &nbsp; SPECTRUM</span>
                <span>{bluetoothConnected ? 'BT-AUDIO' : 'AUX'}</span>
              </div>
              <div className="rd-eqdeck-graph">
                {visualizerMode === 'SPECTRUM' && <SpectrumBars levels={levels} />}
                {visualizerMode === 'PEAK_HOLD' && <PeakHoldBars levels={levels} peaks={peaks} />}
                {visualizerMode === 'VU_METER' && <VuMeter levels={levels} />}
                {visualizerMode === 'WAVE' && <WaveForm levels={levels} />}
                {visualizerMode === 'DOT_MATRIX' && <DotMatrix levels={levels} />}
              </div>
              <div className="rd-eqdeck-trackline">
                <span className="rd-eqdeck-tracknum">TR {String(trackIndex).padStart(2, '0')}</span>
                <div className="rd-eqdeck-titles">
                  <strong>{track.title}</strong>
                  <small>{track.artist}</small>
                </div>
                <span className="tabular-num">{formatTime(elapsed)}</span>
                <span className="tabular-num rd-eqdeck-remaining">-{formatTime(remaining)}</span>
              </div>
              <div className="rd-eqdeck-annunciators">
                {MEDIA_ANNUNCIATORS.EQ_DECK_89.map((a) => (
                  <span key={a} className={eqAnnunciators[a] ? 'on' : undefined} onClick={() => setEqAnnunciators((s) => ({ ...s, [a]: !s[a] }))}>{a}</span>
                ))}
              </div>
              <div className="rd-eqdeck-presets">
                {(['SPECTRUM', 'VU_METER', 'WAVE', 'DOT_MATRIX', 'PEAK_HOLD'] as VisualizerMode[]).map((m, i) => (
                  <button key={m} className={`rd-eqdeck-fbtn${visualizerMode === m ? ' active' : ''}`} onClick={() => setVisualizerMode(m)}>F{i + 1}</button>
                ))}
                <button className="rd-eqdeck-fbtn">F6</button>
              </div>
            </div>
          )}

          {visualStyle === 'DSP_RECEIVER_92' && <DspReceiver92/>}
          {visualStyle === 'EXPEDITION_RECEIVER' && <ExpeditionReceiver/>}

          {visualStyle === 'CD_TUNER_95' && (
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

          {visualStyle === 'MD_DOT_MATRIX_98' && (
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
                ['EQ_DECK_89', '89'],
                ['DSP_RECEIVER_92', '92'],
                ['CD_TUNER_95', '95'],
                ['MD_DOT_MATRIX_98', '98'],
                ['HERITAGE_RADIO', 'HERITAGE'],
                ['EXPEDITION_RECEIVER', 'EXPEDITION'],
              ] as const).map(([style, yr]) => (
                <button key={style} disabled={driving} title={driving?'Select media style while parked':undefined} className={`rd-media-style-btn${style === visualStyle ? ' active' : ''}`} onClick={() => setVisualStyle(style)}>
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
