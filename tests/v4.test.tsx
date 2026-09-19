import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import { useSettingsStore } from '@/state/settingsStore'
import { INITIAL_TELEMETRY, useVehicleStore } from '@/state/vehicleStore'
import { useMediaStore } from '@/state/mediaStore'
import { VISUAL_PROFILES, getVisualProfile } from '@/vehicleProfiles/profiles'
import { VEHICLE_PRESETS } from '@/types/vehicle'
import { stepBoost } from '@/simulator/boost'
import { stepTelemetry, setOverride, clearAllOverrides, resetAutoDrive } from '@/simulator/telemetryEngine'
import { evaluateFaultsAndHealth } from '@/simulator/faultEngine'
import { triggerBootSequence, cancelBootSequence } from '@/simulator/bootController'
import { CLUSTER_LAYOUTS } from '@/cluster/layouts/registry'
import { BootSequence } from '@/cluster/BootSequence'
import { MediaScreen } from '@/cluster/MediaScreen'
import { GpsScreen } from '@/cluster/GpsScreen'
import { PhoneShell } from '@/mobile/PhoneShell'
import { resolveAuxSlot } from '@/utils/auxSlots'
import { makeChannel } from '@/types/telemetry'
import { configureAudio } from '@/audio/sounds'
let passed=0
function check(name:string,fn:()=>void){fn();passed++;console.log('PASS '+name)}
configureAudio({soundEnabled:false})
useSettingsStore.getState().updateSound({soundEnabled:false,startupSoundEnabled:false})
const settings=useSettingsStore.getState, vehicle=useVehicleStore.getState, media=useMediaStore.getState
check('All nine personalities resolve to registered instruments',()=>{
  assert.equal(Object.keys(VISUAL_PROFILES).length,9)
  for(const p of VEHICLE_PRESETS)assert.ok(CLUSTER_LAYOUTS[getVisualProfile(p).defaultClusterTheme])
})
check('Profile selection applies era, instruments and media defaults',()=>{
  settings().setVehiclePresetById('jzx100');assert.equal(settings().display.clusterLayout,'JDM_GT_93');assert.equal(media().visualStyle,'GRAPHIC_EQ_91')
  settings().setVehiclePresetById('minimpi');assert.equal(settings().display.clusterLayout,'MINI_HERITAGE');assert.equal(media().visualStyle,'HERITAGE_RADIO');assert.equal(settings().vehicleProfile.isTurbocharged,false)
})
check('Boost has idle/cruise vacuum, RPM spool and fast throttle lift',()=>{
  let idle=0,cruise=0,low=0,high=0,na=0
  for(let i=0;i<100;i++){
    idle=stepBoost(idle,780,6,15,true,1.5,true,.08)
    cruise=stepBoost(cruise,2800,25,35,true,1.5,true,.08)
    low=stepBoost(low,1800,100,90,true,1.5,true,.08)
    high=stepBoost(high,4500,100,90,true,1.5,true,.08)
    na=stepBoost(na,4500,100,90,false,1.5,true,.08)
  }
  assert.ok(idle < -65 && idle > -80);assert.ok(cruise < -20 && cruise > -50)
  assert.ok(high>130&&low<30&&na<=0)
  for(let i=0;i<6;i++)high=stepBoost(high,4500,0,20,true,1.5,true,.08)
  assert.ok(high<-60)
})
check('Telemetry uses one MAP gauge-pressure calculation and a stationary running idle',()=>{
  settings().setVehiclePresetById('jzx100');useVehicleStore.setState({telemetry:INITIAL_TELEMETRY,ignition:'ON',engine:'IDLE'});vehicle().setConnections({obd:'CONNECTED',gps:'FIX'});resetAutoDrive()
  for(let i=0;i<100;i++)stepTelemetry(.08)
  const t=vehicle().telemetry
  assert.equal(t.speedKph.value,0);assert.ok(t.rpm.value>700);assert.ok(t.boostBar.value<-.65)
  assert.ok(Math.abs(t.mapAbsoluteKpa.value-t.barometricPressureKpa.value-t.boostKpa.value)<1e-8)
  assert.equal(t.boostPsi.value,t.boostKpa.value*.145038)
})
check('OBD disconnect displays GPS speed and GPS loss marks position unavailable',()=>{
  vehicle().setEngine('RUNNING');setOverride('speedKph',90);setOverride('rpm',3000)
  for(let i=0;i<80;i++)stepTelemetry(.08)
  vehicle().setConnections({obd:'FAULT'});stepTelemetry(.08)
  assert.equal(vehicle().speedSourceActive,'GPS');assert.equal(vehicle().telemetry.speedKph.value,vehicle().telemetry.gpsSpeedKph.value)
  vehicle().setConnections({gps:'LOST'});stepTelemetry(.08)
  assert.equal(vehicle().telemetry.latitude.available,false);assert.equal(vehicle().telemetry.speedKph.available,false)
  vehicle().setConnections({gps:'FIX',obd:'CONNECTED'});clearAllOverrides()
})
check('Overboost warning ducks the simulated media and restores on recovery',()=>{
  vehicle().setTelemetry({boostBar:makeChannel(1.7,'DERIVED'),coolantTempC:makeChannel(88,'OBD'),batteryVoltage:makeChannel(14.1,'OBD'),oilPressureBar:makeChannel(3,'OBD')})
  evaluateFaultsAndHealth();assert.ok(vehicle().warnings.some(w=>w.source==='boost'&&w.severity==='CRITICAL'));assert.equal(media().ducked,true)
  vehicle().setTelemetry({boostBar:makeChannel(.1,'DERIVED')});evaluateFaultsAndHealth();assert.equal(media().ducked,false)
})
check('Missing oil pressure substitutes available evidence',()=>{
  const t={...vehicle().telemetry,oilPressureBar:makeChannel(0,'OBD',false)}
  const p=VEHICLE_PRESETS.find(p=>p.id==='minimpi')!
  assert.notEqual(resolveAuxSlot('OIL_PRESSURE',t,p).key,'OIL_PRESSURE')
})
check('Ignition-off stores coordinates and settings/media survive rehydration',()=>{
  vehicle().setTelemetry({latitude:makeChannel(6.9271,'GPS'),longitude:makeChannel(79.8612,'GPS')});vehicle().setIgnition('ON');vehicle().setIgnition('OFF')
  assert.equal(vehicle().parkedLocation?.lat,6.9271)
  settings().setVehiclePresetById('minimpi');settings().updateDisplay({nightMode:true});media().setVisualStyle('CD_94')
  useSettingsStore.persist.rehydrate();useVehicleStore.persist.rehydrate();useMediaStore.persist.rehydrate()
  assert.equal(settings().vehicleProfile.id,'minimpi');assert.equal(settings().display.nightMode,true);assert.equal(media().visualStyle,'CD_94');assert.equal(vehicle().parkedLocation?.lon,79.8612)
})
check('Boot ordering, replay cancellation and final activation stay under four seconds',()=>{
  settings().updateDisplay({startupAnimationEnabled:true});triggerBootSequence();triggerBootSequence()
  const timers=(globalThis as any).__bootTimers as Map<number,{fn:()=>void;ms:number}>
  const queue=[...timers.values()].sort((a,b)=>a.ms-b.ms)
  assert.ok(queue.at(-1)!.ms<=4000)
  const phases:string[]=[];for(const task of queue){task.fn();phases.push(vehicle().bootPhase)}
  assert.ok(phases.indexOf('STATUS_INIT')<phases.indexOf('RPM_SWEEP'));assert.equal(vehicle().bootPhase,'DONE');assert.equal(vehicle().ignition,'ON');assert.equal(vehicle().engine,'IDLE')
  cancelBootSequence();assert.equal(timers.size,0)
})
check('Power-off during boot cannot restart instruments',()=>{
  triggerBootSequence();vehicle().setIgnition('OFF')
  for(const task of (globalThis as any).__bootTimers.values())task.fn()
  assert.equal(vehicle().engine,'OFF');assert.equal(vehicle().bootPhase,'IDLE');cancelBootSequence()
})
check('Every cluster layout renders with populated telemetry',()=>{
  for(const [id,Layout] of Object.entries(CLUSTER_LAYOUTS)){settings().updateDisplay({clusterLayout:id as any});const html=renderToStaticMarkup(<Layout/>);assert.ok(html.length>1000);assert.ok(!html.includes('NaN'))}
})
check('All profile artwork, phone homes, GPS families and five media skins render',()=>{
  for(const p of VEHICLE_PRESETS){settings().setVehiclePresetById(p.id);vehicle().setBootPhase('STATUS_INIT');assert.ok(renderToStaticMarkup(<BootSequence/>).includes('vehicle illustration'),p.id+' boot');const phone=renderToStaticMarkup(<PhoneShell/>);assert.ok(phone.includes(p.nickname),p.id+' phone: '+phone.slice(0,2500));assert.ok(renderToStaticMarkup(<GpsScreen/>).length>1000,p.id+' GPS')}
  for(const style of ['CASSETTE_86','GRAPHIC_EQ_91','CD_94','MINIDISC_98','HERITAGE_RADIO'] as const){media().setVisualStyle(style);assert.ok(renderToStaticMarkup(<MediaScreen/>).includes(style==='HERITAGE_RADIO'?'Heritage Radio':media().currentTrack().title))}
})
console.log(`\n${passed} V4 regression checks passed. Visual browser QA remains separate.`)
