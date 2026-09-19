import './mobile.css'

export function AboutScreen() {
  return (
    <div>
      <div className="rd-m-card" style={{ textAlign: 'center', padding: '28px 18px' }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, color: '#8fcb83' }}>RETRODRIVE</div>
        <div style={{ fontSize: 12, color: '#6c786f', marginTop: 6, letterSpacing: 1 }}>VEHICLE SYSTEM</div>
      </div>

      <div className="rd-m-card">
        <div className="rd-m-row"><span className="rd-m-row-label">App version</span><span className="rd-m-row-value">0.1.0</span></div>
        <div className="rd-m-row"><span className="rd-m-row-label">Simulator build</span><span className="rd-m-row-value">HMI-SIM</span></div>
        <div className="rd-m-row"><span className="rd-m-row-label">Target display</span><span className="rd-m-row-value">1024x600</span></div>
        <div className="rd-m-row"><span className="rd-m-row-label">Target MCU</span><span className="rd-m-row-value">ESP32-S3</span></div>
      </div>

      <div className="rd-m-card">
        <div style={{ fontSize: 12, color: '#6c786f', lineHeight: 1.6 }}>
          RetroDrive is a compact smart auxiliary instrument cluster for enthusiast and heritage vehicles,
          combining OBD-II telemetry, GPS, diagnostics, and AI-assisted maintenance guidance in a
          period-correct interface.
        </div>
      </div>
    </div>
  )
}
