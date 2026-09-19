import { useEffect, useState } from 'react'
import { useVehicleStore } from '@/state/vehicleStore'
import { useSettingsStore } from '@/state/settingsStore'
import { getVisualProfile, isClassicLayout } from '@/vehicleProfiles/profiles'
import { CarSilhouette } from '@/vehicleProfiles/CarSilhouette'
import { ClassicDashboard } from './layouts/ClassicLayouts'
import { JdmGt93 } from './layouts/JdmGt93'
import { JdmDigital86 } from './layouts/JdmDigital86'
import { EuroDigital89 } from './layouts/EuroDigital89'
import { RallyRaid90 } from './layouts/RallyRaid90'
import { Utility80 } from './layouts/Utility80'
import { Touring95 } from './layouts/Touring95'
export function BootSequence() {
  const phase = useVehicleStore(s=>s.bootPhase)
  const vehicle = useSettingsStore(s=>s.vehicleProfile)
  const layout = useSettingsStore(s=>s.display.clusterLayout)
  const visual = getVisualProfile(vehicle), classic = isClassicLayout(layout)
  const [sweep,setSweep] = useState(0)
  useEffect(()=>{
    if(phase!=='RPM_SWEEP') return
    let frame=0; const start=performance.now()
    const tick=(now:number)=>{const p=Math.min(1,(now-start)/1000);setSweep(Math.sin(p*Math.PI));if(p<1)frame=requestAnimationFrame(tick)}
    frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame)
  },[phase])
  if(phase==='BLACK') return <div style={{position:'absolute',inset:0,background:'#000'}}/>
  if((phase==='RPM_SWEEP'||phase==='LAMP_TEST')&&layout==='JDM_DIGITAL_86')return <JdmDigital86 testValue={phase==='LAMP_TEST'?1:sweep}/>
  if((phase==='RPM_SWEEP'||phase==='LAMP_TEST')&&layout==='EURO_DIGITAL_89')return <EuroDigital89 testValue={phase==='LAMP_TEST'?1:sweep}/>
  if((phase==='RPM_SWEEP'||phase==='LAMP_TEST')&&layout==='RALLY_RAID_90')return <RallyRaid90 testValue={phase==='LAMP_TEST'?1:sweep}/>
  if((phase==='RPM_SWEEP'||phase==='LAMP_TEST')&&layout==='UTILITY_80')return <Utility80 testValue={phase==='LAMP_TEST'?1:sweep}/>
  if((phase==='RPM_SWEEP'||phase==='LAMP_TEST')&&layout==='TOURING_95')return <Touring95 testValue={phase==='LAMP_TEST'?1:sweep}/>
  if(phase==='RPM_SWEEP' || phase==='LAMP_TEST') return classic ? <ClassicDashboard testValue={phase==='LAMP_TEST'?0:sweep} variant={layout==='MINI_HERITAGE'?'mini':layout==='VINTAGE_TOURER'||layout==='EXPEDITION_60'?'tourer':layout==='GRAND_TOURING_62'?'touring':'roadster'}/> : <JdmGt93 testValue={phase==='LAMP_TEST'?1:sweep}/>
  const progress=phase==='SEGMENT_TEST'?.18:phase==='STATUS_INIT'?.7:1
  return <div className={`rd-vehicle-boot ${classic?'rd-boot-classic':''}`}>
    <h1>RETRODRIVE</h1><small>{classic?'PRECISION MOTORING INSTRUMENTS':'VEHICLE INTELLIGENCE / SERIES 04'}</small>
    <CarSilhouette artwork={visual.carArtwork} animated/>
    <h2>{vehicle.nickname}</h2>
    <div className="rd-boot-checks">{(classic?['IGNITION','INSTRUMENTS','POSITION','AUDIO','READY']:['SYSTEM','ECU LINK','GPS','AUDIO','MEMORY']).map((label,i)=><div key={label}><span>{label}</span><i><b style={{width:`${Math.min(100,Math.max(0,progress*160-i*15))}%`}}/></i></div>)}</div>
    <div className="rd-boot-progress"><i style={{width:`${progress*100}%`}}/></div><span className="rd-boot-caption">{phase==='SYSTEM_OK'?'READY FOR THE ROAD':classic?'Preparing your instruments':'INITIALIZING VEHICLE SYSTEMS'}</span>
  </div>
}
