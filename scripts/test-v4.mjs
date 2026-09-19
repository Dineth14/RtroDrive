import { build } from 'esbuild'
import Module from 'node:module'
import React from 'react'
import { resolve } from 'node:path'
const storage=new Map()
globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)}
const timers=new Map();let sequence=0
globalThis.window={setTimeout:(fn,ms)=>{const id=++sequence;timers.set(id,{fn,ms});return id},clearTimeout:id=>timers.delete(id),setInterval:()=>++sequence,clearInterval:()=>{}}
globalThis.window.localStorage=globalThis.localStorage
globalThis.requestAnimationFrame=()=>++sequence
globalThis.cancelAnimationFrame=()=>{}
globalThis.__bootTimers=timers
// Server rendering normally uses Zustand's initial snapshot. This harness renders
// the current simulated store without subscribing, so profile variants are tested.
React.useSyncExternalStore=(_subscribe,getSnapshot)=>getSnapshot()
const result=await build({entryPoints:['tests/v4.test.tsx'],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',loader:{'.css':'empty'},tsconfig:'tsconfig.app.json'})
const filename=resolve('tests/v4.compiled.cjs')
const testModule=new Module(filename)
testModule.filename=filename
testModule.paths=Module._nodeModulePaths(resolve('tests'))
testModule._compile(result.outputFiles[0].text,filename)
