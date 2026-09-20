import { spawn } from 'node:child_process'
const child = spawn(process.execPath, ['node_modules/vite/bin/vite.js','apps/simulator-web','--config','apps/simulator-web/vite.config.ts','--host','127.0.0.1','--port','5174','--strictPort'], { stdio:'pipe', windowsHide:true })
let logs='';child.stdout.on('data',chunk=>logs+=chunk);child.stderr.on('data',chunk=>logs+=chunk)
try {
  let ready=false
  for(let i=0;i<40;i++) {
    if(child.exitCode!==null) throw new Error(logs)
    try { if((await fetch('http://127.0.0.1:5174/')).ok) {ready=true;break} } catch {}
    await new Promise(resolve=>setTimeout(resolve,100))
  }
  if(!ready) throw new Error('Vite did not start: '+logs)
  for(const path of ['/', '/src/app/App.tsx', '/src/data/MockTelemetrySource.ts', '/src/data/SourceLivePanel.tsx']) {
    const response=await fetch('http://127.0.0.1:5174'+path)
    if(!response.ok) throw new Error(path+': '+await response.text())
  }
  console.log('PASS Vite serves relocated entry, app and data source modules over HTTP')
} finally { child.kill() }
