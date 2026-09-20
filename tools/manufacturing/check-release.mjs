import { existsSync, readFileSync } from 'node:fs'
const path = 'hardware/manufacturing/release-manifest.json'
if (!existsSync(path)) throw new Error('No reviewed hardware release manifest. Fabrication is blocked.')
const manifest = JSON.parse(readFileSync(path))
for (const key of ['schematic','pcb','ercReport','drcReport','reviewedBom','stackup','mechanicalDrawing','verificationReport']) {
  if (typeof manifest[key] !== 'string' || manifest[key].includes('..') || !existsSync(manifest[key])) throw new Error(`Missing release evidence: ${key}`)
}
if (manifest.releaseApproved !== true || !manifest.reviewedBy || !manifest.reviewedAt) throw new Error('Hardware design review is incomplete')
console.log('Manifest evidence paths exist. This does not establish ERC/DRC or physical pass status.')
