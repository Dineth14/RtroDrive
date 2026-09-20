import { build } from 'esbuild'
import { mkdirSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
mkdirSync('.build', { recursive: true })
const result = await build({ entryPoints: ['apps/simulator-web/tests/sources.test.tsx'], bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', loader: { '.css': 'empty' }, tsconfig: 'apps/simulator-web/tsconfig.app.json' })
writeFileSync('.build/sources.cjs', result.outputFiles[0].text)
process.exitCode = spawnSync(process.execPath, ['.build/sources.cjs'], { stdio: 'inherit' }).status ?? 1
