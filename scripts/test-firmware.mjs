import { spawnSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
mkdirSync('.build', { recursive: true })
const mini = 'firmware/components/vehicle_profiles/mini_mems2j/'
const files = ['firmware/components/generic_obd/obd.cpp', 'firmware/components/generic_obd/isotp.cpp', ...['mini_mems2j_protocol.cpp','mini_mems2j_profile.cpp','mini_mems2j_pids.cpp','mini_mems2j_faults.cpp'].map(f=>mini+f), 'firmware/test/protocol_test.cpp']
const output = resolve('.build/firmware-tests' + (process.platform === 'win32' ? '.exe' : ''))
const compile = spawnSync(process.env.CXX ?? 'g++', ['-std=c++14','-Wall','-Wextra','-Werror','-pedantic','-Ifirmware/components/generic_obd','-I'+mini,...files,'-o',output], { stdio:'inherit' })
if (compile.error) console.error(compile.error.message)
if (compile.status !== 0) process.exit(compile.status ?? 1)
const run = spawnSync(output, [], { stdio: 'inherit' })
process.exitCode = run.status ?? 1
