import { useEffect, useState } from 'react'
import { useVehicleStore } from '@/state/vehicleStore'

export function StatusBar() {
  const connections = useVehicleStore((s) => s.connections)
  const dtcs = useVehicleStore((s) => s.dtcs)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000)
    return () => window.clearInterval(id)
  }, [])

  const activeDtcCount = dtcs.filter((d) => d.status === 'ACTIVE').length
  const issues: string[] = []
  if (connections.obd !== 'CONNECTED') issues.push('OBD')
  if (connections.gps === 'LOST') issues.push('GPS')
  if (connections.phone !== 'CONNECTED') issues.push('PHONE')

  const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })

  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        left: 34,
        right: 34,
        height: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 11,
        letterSpacing: 2,
        color: 'var(--cl-muted-text)',
        zIndex: 60,
      }}
    >
      <span>{timeStr}</span>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        {activeDtcCount > 0 && (
          <span style={{ color: 'var(--cl-warning-amber)' }}>DTC &times;{activeDtcCount}</span>
        )}
        {issues.map((label) => (
          <span key={label} style={{ color: 'var(--cl-critical-red)' }}>
            {label} LINK LOST
          </span>
        ))}
      </div>
    </div>
  )
}
