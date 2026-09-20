import { useVehicleStore } from '@/state/vehicleStore'
import './mobile.css'

function StatusChip({ state }: { state: string }) {
  const cls = state === 'CONNECTED' || state === 'FIX' ? 'rd-m-status-normal' : state === 'CONNECTING' || state === 'SEARCHING' ? 'rd-m-status-observe' : 'rd-m-status-critical'
  return <span className={`rd-m-status-chip ${cls}`}>{state}</span>
}

export function ConnectivityScreen() {
  const connections = useVehicleStore((s) => s.connections)
  const hardware = useVehicleStore((s) => s.hardware)
  const setConnections = useVehicleStore((s) => s.setConnections)
  const setHardware = useVehicleStore((s) => s.setHardware)

  const reconnectObd = () => {
    setConnections({ obd: 'CONNECTED' })
    setHardware({ can: 'CONNECTED', obdProtocol: 'CONNECTED' })
  }
  const reconnectGps = () => {
    setConnections({ gps: 'FIX' })
    setHardware({ gnss: 'CONNECTED' })
  }
  const reconnectPhone = () => setConnections({ phone: 'CONNECTED' })

  return (
    <div>
      <div className="rd-m-card">
        <div className="rd-m-card-title">LINKS</div>
        <div className="rd-m-row">
          <span className="rd-m-row-label">OBD-II (Vehicle)</span>
          <StatusChip state={connections.obd} />
        </div>
        <div className="rd-m-row">
          <span className="rd-m-row-label">GPS / GNSS</span>
          <StatusChip state={connections.gps} />
        </div>
        <div className="rd-m-row">
          <span className="rd-m-row-label">Phone Bluetooth</span>
          <StatusChip state={connections.phone} />
        </div>
        <div className="rd-m-row">
          <span className="rd-m-row-label">Audio</span>
          <StatusChip state={connections.audio} />
        </div>
      </div>

      <div className="rd-m-card" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="rd-m-btn" onClick={reconnectObd}>Reconnect OBD</button>
        <button className="rd-m-btn" onClick={reconnectGps}>Reconnect GPS</button>
        <button className="rd-m-btn" onClick={reconnectPhone}>Reconnect Phone</button>
      </div>

      <div className="rd-m-card">
        <div className="rd-m-card-title">HARDWARE STATE (DEV)</div>
        {Object.entries(hardware).map(([key, val]) => (
          <div className="rd-m-row" key={key}>
            <span className="rd-m-row-label" style={{ textTransform: 'uppercase' }}>{key}</span>
            <StatusChip state={val} />
          </div>
        ))}
      </div>
    </div>
  )
}
