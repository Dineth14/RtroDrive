import { writeFileSync } from 'node:fs'
import { simulatedPacket } from '../tools/vehicle-simulator/simulator.mjs'
writeFileSync('tests/recordings/demo.jsonl', Array.from({length:30},(_,i)=>JSON.stringify(simulatedPacket(i,'rpm-sweep','recording-demo'))).join('\n')+'\n')
