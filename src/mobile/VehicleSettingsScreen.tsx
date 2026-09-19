import { useSettingsStore } from '@/state/settingsStore'
import { VEHICLE_PRESETS } from '@/types/vehicle'
import './mobile.css'

export function VehicleSettingsScreen() {
  const profile = useSettingsStore((s) => s.vehicleProfile)
  const setVehicleProfile = useSettingsStore((s) => s.setVehicleProfile)
  const setPresetById = useSettingsStore((s) => s.setVehiclePresetById)

  return (
    <div>
      <div className="rd-m-card">
        <div className="rd-m-card-title">NICKNAME</div>
        <input
          value={profile.nickname}
          onChange={(e) => setVehicleProfile({ ...profile, nickname: e.target.value })}
          style={{
            width: '100%',
            background: '#0d1210',
            border: '1px solid #263029',
            borderRadius: 8,
            padding: '10px 12px',
            color: '#e4ece6',
            fontSize: 14,
          }}
        />
      </div>

      <div className="rd-m-card">
        <div className="rd-m-card-title">VEHICLE PROFILE</div>
        <div className="rd-m-row"><span className="rd-m-row-label">Manufacturer</span><span className="rd-m-row-value">{profile.manufacturer}</span></div>
        <div className="rd-m-row"><span className="rd-m-row-label">Model</span><span className="rd-m-row-value">{profile.model}</span></div>
        <div className="rd-m-row"><span className="rd-m-row-label">Year</span><span className="rd-m-row-value">{profile.year}</span></div>
        <div className="rd-m-row"><span className="rd-m-row-label">Engine</span><span className="rd-m-row-value">{profile.engine}</span></div>
        <div className="rd-m-row"><span className="rd-m-row-label">Fuel type</span><span className="rd-m-row-value">{profile.fuelType}</span></div>
        <div className="rd-m-row"><span className="rd-m-row-label">Redline</span><span className="rd-m-row-value">{profile.redlineRpm} rpm</span></div>
      </div>

      <div className="rd-m-section-label">SELECT TEST PROFILE</div>
      <div className="rd-m-card">
        {VEHICLE_PRESETS.map((p) => (
          <div className="rd-m-row clickable" key={p.id} onClick={() => setPresetById(p.id)}>
            <span className="rd-m-row-label">{p.nickname}</span>
            {p.id === profile.id && <span style={{ color: '#8fcb83', fontSize: 12 }}>ACTIVE</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
