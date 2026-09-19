import { Bluetooth, Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import { useMediaStore, TRACKS } from '@/state/mediaStore'
import { SpectrumVisualizer } from './widgets/SpectrumVisualizer'
import './MediaScreen.css'

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MediaScreen() {
  const isPlaying = useMediaStore((s) => s.isPlaying)
  const elapsed = useMediaStore((s) => s.elapsedSeconds)
  const bluetoothConnected = useMediaStore((s) => s.bluetoothConnected)
  const visualStyle = useMediaStore((s) => s.visualStyle)
  const levels = useMediaStore((s) => s.levels)
  const currentTrackId = useMediaStore((s) => s.currentTrackId)
  const togglePlay = useMediaStore((s) => s.togglePlay)
  const next = useMediaStore((s) => s.next)
  const previous = useMediaStore((s) => s.previous)
  const setVisualStyle = useMediaStore((s) => s.setVisualStyle)

  const track = TRACKS.find((t) => t.id === currentTrackId) ?? TRACKS[0]
  const progress = Math.min(1, elapsed / track.durationSeconds)

  return (
    <div className="rd-screen">
      <div className="rd-media">
        <div className="rd-media-visual">
          {visualStyle === 'CASSETTE_86' && (
            <div className="rd-cassette">
              <div className={`rd-cassette-reel${isPlaying ? ' spin' : ''}`} />
              <div className={`rd-cassette-reel${isPlaying ? ' spin' : ''}`} />
            </div>
          )}
          {visualStyle === 'CD_92' && <div className={`rd-cd${isPlaying ? ' spin' : ''}`} />}
          {visualStyle === 'MINIDISC_97' && (
            <div className="rd-md">
              <div className={`rd-md-disc${isPlaying ? ' spin' : ''}`} />
            </div>
          )}
          <span className="rd-media-style-label">
            {visualStyle === 'CASSETTE_86' ? 'CASSETTE 86' : visualStyle === 'CD_92' ? 'CD 92' : 'MINIDISC 97'}
          </span>
          <div className="rd-media-styles">
            {(['CASSETTE_86', 'CD_92', 'MINIDISC_97'] as const).map((style) => (
              <button
                key={style}
                className={`rd-media-style-btn${style === visualStyle ? ' active' : ''}`}
                onClick={() => setVisualStyle(style)}
              >
                {style === 'CASSETTE_86' ? '86' : style === 'CD_92' ? '92' : '97'}
              </button>
            ))}
          </div>
        </div>

        <div className="rd-media-info">
          <div className="rd-media-topline">
            <span>BLUETOOTH AUDIO</span>
            <span className="rd-media-bt" style={{ color: bluetoothConnected ? 'var(--cl-primary)' : 'var(--cl-muted-text)' }}>
              <Bluetooth size={13} /> {bluetoothConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          <div>
            <div className="rd-media-title">{track.title}</div>
            <div className="rd-media-artist">{track.artist}</div>
          </div>

          <div className="rd-media-progress-row">
            <span className="tabular-num">{formatTime(elapsed)}</span>
            <div className="rd-media-progress-track">
              <div className="rd-media-progress-fill" style={{ width: `${progress * 100}%` }} />
            </div>
            <span className="tabular-num">{formatTime(track.durationSeconds)}</span>
          </div>

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

          <SpectrumVisualizer levels={levels} active={isPlaying} />
        </div>
      </div>
    </div>
  )
}
