import { useSettingsStore } from '@/state/settingsStore'
import { VEHICLE_PRESETS } from '@/types/vehicle'
import type { BoostUnit } from '@/types/vehicle'
import { ToggleRow, SliderRow } from './MobileControls'
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

      <div className="rd-m-card">
        <div className="rd-m-card-title">FORCED INDUCTION</div>
        <ToggleRow label="Turbocharged" on={profile.isTurbocharged} onChange={(v) => setVehicleProfile({ ...profile, isTurbocharged: v, maxBoostBar:profile.maxBoostBar||1.5, boostWarningBar:profile.boostWarningBar||1.2, boostCriticalBar:profile.boostCriticalBar||1.4 })} />
        {profile.isTurbocharged && (
          <>
            <div className="rd-m-row">
              <span className="rd-m-row-label">Boost units</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['BAR', 'PSI'] as BoostUnit[]).map((u) => (
                  <button
                    key={u}
                    className="rd-m-btn"
                    style={u === profile.boostUnit ? { borderColor: '#345c40', color: '#b6e5a8' } : undefined}
                    onClick={() => setVehicleProfile({ ...profile, boostUnit: u })}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <SliderRow label="Max boost" value={profile.maxBoostBar} min={0.5} max={2} step={0.1} unit=" bar" onChange={(v) => setVehicleProfile({ ...profile, maxBoostBar: v })} />
            <SliderRow label="Warning boost" value={profile.boostWarningBar} min={0.5} max={2} step={0.1} unit=" bar" onChange={(v) => setVehicleProfile({ ...profile, boostWarningBar: v })} />
            <SliderRow label="Critical boost" value={profile.boostCriticalBar} min={0.5} max={2} step={0.1} unit=" bar" onChange={(v) => setVehicleProfile({ ...profile, boostCriticalBar: v })} />
          </>
        )}
      </div>

      <div className="rd-m-section-label">SELECT TEST PROFILE</div>
      <div className="rd-m-card">
        {VEHICLE_PRESETS.map((p) => (
          <div className="rd-m-row clickable" key={p.id} onClick={() => setPresetById(p.id)}>
            <div>
              <div className="rd-m-row-label">{p.nickname}</div>
              <div style={{ fontSize: 11, color: '#6c786f' }}>{p.isTurbocharged ? 'Turbocharged' : 'Naturally aspirated'}</div>
            </div>
            {p.id === profile.id && <span style={{ color: '#8fcb83', fontSize: 12 }}>ACTIVE</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
