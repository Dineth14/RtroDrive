import { useMediaStore } from '@/state/mediaStore'
import { MediaSettingsScreen } from './MediaSettingsScreen'
export function MediaPlayerScreen() {
  const m=useMediaStore(),track=m.currentTrack()
  return <div className="phone-media-player"><span>RETRODRIVE / WIRELESS AUDIO</span><div className="phone-spectrum">{m.levels.map((v,i)=><i key={i} style={{height:`${Math.max(2,v*100)}%`}}/>)}</div><h2>{track.title}</h2><p>{track.artist}</p><progress value={m.elapsedSeconds} max={track.durationSeconds}/><div className="phone-media-time">{Math.floor(m.elapsedSeconds/60)}:{String(Math.floor(m.elapsedSeconds%60)).padStart(2,'0')} / {Math.floor(track.durationSeconds/60)}:{String(track.durationSeconds%60).padStart(2,'0')}</div><div className="phone-transport"><button onClick={m.previous}>PREV</button><button onClick={m.togglePlay}>{m.isPlaying?'PAUSE':'PLAY'}</button><button onClick={m.next}>NEXT</button></div><MediaSettingsScreen/></div>
}
