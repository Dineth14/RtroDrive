import { useMediaStore } from '@/state/mediaStore'
import { useVehicleStore } from '@/state/vehicleStore'
import { formatTime } from '../MediaScreen'
import './media.css'

export function ExpeditionReceiver() {
  const media = useMediaStore()
  const track = media.currentTrack()
  const battery = useVehicleStore((s) => s.telemetry.batteryVoltage.value)
  const sats = useVehicleStore((s) => s.telemetry.satelliteCount.value)
  const gpsFix = useVehicleStore((s) => s.connections.gps === 'FIX')

  return (
    <div className="rd-exp-receiver">
      <div className="rd-exp-row">
        <span>SOURCE: {media.bluetoothConnected ? 'BT AUDIO' : 'AUX'}</span>
        <span>VOL 68%</span>
        <span className="tabular-num">{formatTime(media.elapsedSeconds)}</span>
      </div>

      <div className="rd-exp-track">
        <strong>{track.title}</strong>
        <small>{track.artist}</small>
      </div>

      <div className="rd-exp-spectrum">
        {media.levels.slice(0, 12).map((l, i) => (
          <div key={i} className="rd-exp-bar" style={{ height: `${Math.max(8, l * 100)}%` }} />
        ))}
      </div>

      <div className="rd-exp-status-grid">
        <div><label>SIGNAL</label><strong>{gpsFix ? 'GOOD' : 'WEAK'}</strong></div>
        <div><label>BATTERY</label><strong>{battery.toFixed(1)}V</strong></div>
        <div><label>GPS SAT</label><strong>{sats}</strong></div>
      </div>
    </div>
  )
}
