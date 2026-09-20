import { mkdirSync, writeFileSync } from 'node:fs'
import { telemetrySchema } from '../shared/telemetry.mjs'
mkdirSync('shared/schemas', { recursive: true })
writeFileSync('shared/schemas/telemetry-v1.json', JSON.stringify(telemetrySchema(), null, 2) + '\n')
