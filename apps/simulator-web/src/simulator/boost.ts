/** Gauge pressure model. A closed throttle creates vacuum; spool requires load. */
export function stepBoost(currentKpa: number, rpm: number, throttlePercent: number, loadPercent: number, turbo: boolean, maxBoostBar: number, running: boolean, dt: number) {
  if (!running) return currentKpa + (0-currentKpa)*(1-Math.exp(-8*dt))
  const throttle=Math.max(0,Math.min(1,throttlePercent/100))
  const demand=Math.max(0,Math.min(1,(throttle-.38)/.52))
  const spool=Math.max(0,Math.min(1,(rpm-1500)/2600))
  const load=Math.max(0,Math.min(1,loadPercent/70))
  const vacuum=-75*Math.max(0,1-throttle/.65)
  const positive=turbo?maxBoostBar*100*demand*spool*load:0
  const target=vacuum+positive
  const rate=target<currentKpa?10:1+Math.max(0,Math.min(1,rpm/7000))*4
  return currentKpa+(target-currentKpa)*(1-Math.exp(-rate*dt))
}
