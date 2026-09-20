import { readFileSync } from 'node:fs'
import { validateTelemetry } from '../../shared/telemetry.mjs'
const path = process.argv[2]
if (!path) throw new Error('Usage: node tools/log-analyzer/analyze.mjs recording.jsonl')
const contents = readFileSync(path, 'utf8')
if (contents.length > 8 * 1024 * 1024) throw new Error('Recording exceeds 8 MiB limit')
const stats = {}
let records = 0
for (const line of contents.split(/\r?\n/).filter(line => line.trim())) {
  const packet = validateTelemetry(JSON.parse(line)); records++
  for (const [name, sample] of Object.entries(packet.channels)) {
    const row = stats[name] ??= { valid: 0, invalid: 0, min: null, max: null, sources: [] }
    if (!row.sources.includes(sample.source)) row.sources.push(sample.source)
    if (!sample.valid) { row.invalid++; continue }
    row.valid++; row.min = row.min === null ? sample.value : Math.min(row.min, sample.value)
    row.max = row.max === null ? sample.value : Math.max(row.max, sample.value)
  }
}
console.log(JSON.stringify({ records, channels: stats }, null, 2))
