import { lazy, Suspense, useState } from 'react'
import { Home, Activity, AlertTriangle, Route, Settings, ChevronLeft, MapPin, Music } from 'lucide-react'
import { useSettingsStore } from '@/state/settingsStore'
import { getVisualProfile } from '@/vehicleProfiles/profiles'
import { MediaPlayerScreen } from './MediaPlayerScreen'
import { useVehicleStore } from '@/state/vehicleStore'
import { HomeScreen } from './HomeScreen'
const LiveDataScreen=lazy(()=>import('./LiveDataScreen').then(m=>({default:m.LiveDataScreen})))
import { GpsMapScreen } from './GpsMapScreen'
import { DiagnosticsScreen } from './DiagnosticsScreen'
import { DiagnosticDetailScreen } from './DiagnosticDetailScreen'
import { TripsScreen } from './TripsScreen'
import { TripDetailScreen } from './TripDetailScreen'
import { SettingsHomeScreen } from './SettingsHomeScreen'
import { VehicleSettingsScreen } from './VehicleSettingsScreen'
import { DisplaySettingsScreen } from './DisplaySettingsScreen'
import { SoundSettingsScreen } from './SoundSettingsScreen'
import { WarningSettingsScreen } from './WarningSettingsScreen'
import { ConnectivityScreen } from './ConnectivityScreen'
import { AboutScreen } from './AboutScreen'
import { MediaSettingsScreen } from './MediaSettingsScreen'
import './PhoneShell.css'
import './vehicleThemes.css'

export type PhoneScreenId =
  | 'HOME'
  | 'MEDIA'
  | 'LIVE'
  | 'GPS'
  | 'DIAG_LIST'
  | 'DIAG_DETAIL'
  | 'TRIPS_LIST'
  | 'TRIP_DETAIL'
  | 'SETTINGS_HOME'
  | 'SETTINGS_VEHICLE'
  | 'SETTINGS_DISPLAY'
  | 'SETTINGS_SOUND'
  | 'SETTINGS_WARNINGS'
  | 'SETTINGS_CONNECTIVITY'
  | 'SETTINGS_MEDIA'
  | 'SETTINGS_ABOUT'

type Tab = 'HOME' | 'LIVE' | 'GPS' | 'DIAG' | 'TRIPS' | 'MEDIA' | 'SETTINGS'

const TAB_HOME_SCREEN: Record<Tab, PhoneScreenId> = {
  MEDIA: 'MEDIA',
  HOME: 'HOME',
  LIVE: 'LIVE',
  GPS: 'GPS',
  DIAG: 'DIAG_LIST',
  TRIPS: 'TRIPS_LIST',
  SETTINGS: 'SETTINGS_HOME',
}

const SCREEN_TITLES: Record<PhoneScreenId, string> = {
  MEDIA: 'AUDIO',
  HOME: 'RETRODRIVE',
  LIVE: 'LIVE DATA',
  GPS: 'GPS / MAP',
  DIAG_LIST: 'DIAGNOSTICS',
  DIAG_DETAIL: 'DIAGNOSTIC DETAIL',
  TRIPS_LIST: 'TRIPS',
  TRIP_DETAIL: 'TRIP DETAIL',
  SETTINGS_HOME: 'SETTINGS',
  SETTINGS_VEHICLE: 'VEHICLE',
  SETTINGS_DISPLAY: 'DISPLAY',
  SETTINGS_SOUND: 'SOUND',
  SETTINGS_WARNINGS: 'WARNINGS',
  SETTINGS_CONNECTIVITY: 'CONNECTIVITY',
  SETTINGS_MEDIA: 'MEDIA',
  SETTINGS_ABOUT: 'ABOUT',
}

const BACK_TARGET: Partial<Record<PhoneScreenId, PhoneScreenId>> = {
  DIAG_DETAIL: 'DIAG_LIST',
  TRIP_DETAIL: 'TRIPS_LIST',
  SETTINGS_VEHICLE: 'SETTINGS_HOME',
  SETTINGS_DISPLAY: 'SETTINGS_HOME',
  SETTINGS_SOUND: 'SETTINGS_HOME',
  SETTINGS_WARNINGS: 'SETTINGS_HOME',
  SETTINGS_CONNECTIVITY: 'SETTINGS_HOME',
  SETTINGS_MEDIA: 'SETTINGS_HOME',
  SETTINGS_ABOUT: 'SETTINGS_HOME',
}

export function PhoneShell() {
  const vehicle=useSettingsStore(s=>s.vehicleProfile)
  const visual=getVisualProfile(vehicle)
  const [screen, setScreen] = useState<PhoneScreenId>('HOME')
  const [activeTab, setActiveTab] = useState<Tab>('HOME')
  const [selectedDtc, setSelectedDtc] = useState<string | null>(null)
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null)
  const speed = useVehicleStore((s) => s.telemetry.speedKph.value)
  const driving = speed > 5

  const goTab = (tab: Tab) => {
    setActiveTab(tab)
    setScreen(TAB_HOME_SCREEN[tab])
  }

  const openDtc = (code: string) => {
    setSelectedDtc(code)
    setScreen('DIAG_DETAIL')
  }
  const openTrip = (id: string) => {
    setSelectedTrip(id)
    setScreen('TRIP_DETAIL')
  }

  const backTarget = BACK_TARGET[screen]
  const [now] = useState(() => new Date())

  return (
    <div className="rd-phone-bezel">
      <div className="rd-phone-notch" />
      <div className="rd-phone-screen" data-era={visual.era} data-profile={visual.id}>
        <div className="rd-phone-statusbar">
          <span>{now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
          <span>RETRODRIVE</span>
          <span>100%</span>
        </div>

        <div className="rd-phone-header" style={{ padding: '8px 20px 16px' }}>
          {backTarget && (
            <button className="rd-phone-back" onClick={() => setScreen(backTarget)}>
              <ChevronLeft size={22} />
            </button>
          )}
          <span className="rd-phone-header-title">{SCREEN_TITLES[screen]}</span>
        </div>

        <div className="rd-phone-content">
          {driving && (screen === 'SETTINGS_VEHICLE' || screen === 'SETTINGS_WARNINGS') && (
            <div className="rd-m-driving-warning">VEHICLE IN MOTION — CHANGES MAY BE DISTRACTING. PROCEED WITH CAUTION.</div>
          )}

          {screen === 'HOME' && <HomeScreen onOpenDtc={openDtc} onViewLocation={() => goTab('GPS')} />}
          {screen === 'LIVE' && <Suspense fallback={<div className="rd-m-empty">READING INSTRUMENTS…</div>}><LiveDataScreen /></Suspense>}
          {screen === 'MEDIA' && <MediaPlayerScreen/>}
          {screen === 'GPS' && <GpsMapScreen />}
          {screen === 'DIAG_LIST' && <DiagnosticsScreen onOpenDtc={openDtc} />}
          {screen === 'DIAG_DETAIL' && selectedDtc && <DiagnosticDetailScreen code={selectedDtc} />}
          {screen === 'TRIPS_LIST' && <TripsScreen onOpenTrip={openTrip} />}
          {screen === 'TRIP_DETAIL' && selectedTrip && <TripDetailScreen tripId={selectedTrip} />}
          {screen === 'SETTINGS_HOME' && <SettingsHomeScreen onNavigate={setScreen} />}
          {screen === 'SETTINGS_VEHICLE' && <VehicleSettingsScreen />}
          {screen === 'SETTINGS_DISPLAY' && <DisplaySettingsScreen />}
          {screen === 'SETTINGS_SOUND' && <SoundSettingsScreen />}
          {screen === 'SETTINGS_WARNINGS' && <WarningSettingsScreen />}
          {screen === 'SETTINGS_CONNECTIVITY' && <ConnectivityScreen />}
          {screen === 'SETTINGS_MEDIA' && <MediaSettingsScreen />}
          {screen === 'SETTINGS_ABOUT' && <AboutScreen />}
        </div>

        <div className="rd-phone-tabbar">
          {(
            [
              ['HOME', Home, 'HOME'],
              ['LIVE', Activity, 'LIVE'],
              ['GPS', MapPin, 'GPS'],
              ['DIAG', AlertTriangle, 'DIAG'],
              ['TRIPS', Route, 'TRIPS'],
              ['MEDIA', Music, 'MEDIA'],
              ['SETTINGS', Settings, 'MORE'],
            ] as const
          ).map(([tab, Icon, label]) => (
            <button key={tab} className={`rd-phone-tab${activeTab === tab ? ' active' : ''}`} onClick={() => goTab(tab)}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
