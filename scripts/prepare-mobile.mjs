import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { simulatedPacket } from '../tools/vehicle-simulator/simulator.mjs'
mkdirSync('apps/mobile/assets', { recursive: true })
const profiles = readdirSync('shared/vehicle-profiles').filter(n=>n.endsWith('.json')).sort().map(n=>JSON.parse(readFileSync(`shared/vehicle-profiles/${n}`)))
writeFileSync('apps/mobile/assets/profiles.json', JSON.stringify(profiles,null,2)+'\n')
writeFileSync('apps/mobile/assets/demo-telemetry.json', JSON.stringify(simulatedPacket(0),null,2)+'\n')
