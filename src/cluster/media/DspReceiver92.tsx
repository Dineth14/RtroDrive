import { useMediaStore, TRACKS } from '@/state/mediaStore'
import { MEDIA_ANNUNCIATORS } from '@/types/media'
import { formatTime } from '../MediaScreen'
import './media.css'

export function DspReceiver92() {
  const media = useMediaStore()
  const track = media.currentTrack()
  const trackIndex = TRACKS.findIndex((t) => t.id === media.currentTrackId) + 1
  const left = media.levels.slice(0, 6).reduce((a, b) => a + b, 0) / 6
  const right = media.levels.slice(6).reduce((a, b) => a + b, 0) / 6

  return (
    <div className="rd-dsp92">
      <div className="rd-dsp92-row rd-dsp92-top">
        <span>{media.bluetoothConnected ? 'BT AUDIO' : 'AUX IN'}</span>
        <span className="rd-dsp92-label">DSP RECEIVER</span>
        <span className="tabular-num">{formatTime(media.elapsedSeconds)}</span>
      </div>

      <div className="rd-dsp92-spectrum">
        {media.levels.map((l, i) => (
          <div key={i} className="rd-dsp92-bar-col">
            <div className="rd-dsp92-bar" style={{ height: `${Math.max(4, l * 100)}%` }} />
          </div>
        ))}
      </div>

      <div className="rd-dsp92-track">
        <span className="rd-dsp92-tracknum">TRACK {String(trackIndex).padStart(2, '0')}</span>
        <strong>{track.title}</strong>
        <small>{track.artist}</small>
      </div>

      <div className="rd-dsp92-vu">
        {[['L', left], ['R', right]].map(([label, val]) => (
          <div className="rd-dsp92-vu-channel" key={label as string}>
            <span>{label}</span>
            <div className="rd-dsp92-vu-track">
              <div className="rd-dsp92-vu-fill" style={{ width: `${(val as number) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="rd-dsp92-annunciators">
        {MEDIA_ANNUNCIATORS.DSP_RECEIVER_92.map((a) => (
          <span key={a} className={a === 'DSP' || a === 'ST' ? 'on' : undefined}>{a}</span>
        ))}
      </div>
    </div>
  )
}
