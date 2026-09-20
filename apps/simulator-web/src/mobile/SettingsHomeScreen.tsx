import { Car, Monitor, Volume2, ShieldAlert, Wifi, Music, Info, ChevronRight } from 'lucide-react'
import type { PhoneScreenId } from './PhoneShell'
import './mobile.css'

const ITEMS: { id: PhoneScreenId; label: string; icon: typeof Car }[] = [
  { id: 'SETTINGS_VEHICLE', label: 'VEHICLE', icon: Car },
  { id: 'SETTINGS_DISPLAY', label: 'DISPLAY', icon: Monitor },
  { id: 'SETTINGS_SOUND', label: 'SOUND', icon: Volume2 },
  { id: 'SETTINGS_WARNINGS', label: 'WARNINGS', icon: ShieldAlert },
  { id: 'SETTINGS_CONNECTIVITY', label: 'CONNECTIVITY', icon: Wifi },
  { id: 'SETTINGS_MEDIA', label: 'MEDIA', icon: Music },
  { id: 'SETTINGS_ABOUT', label: 'ABOUT', icon: Info },
]

export function SettingsHomeScreen({ onNavigate }: { onNavigate: (id: PhoneScreenId) => void }) {
  return (
    <div className="rd-m-card">
      {ITEMS.map(({ id, label, icon: Icon }) => (
        <div className="rd-m-row clickable" key={id} onClick={() => onNavigate(id)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon size={17} color="#8fcb83" />
            <span className="rd-m-row-label">{label}</span>
          </div>
          <ChevronRight size={16} color="#5f6b64" />
        </div>
      ))}
    </div>
  )
}
