/**
 * Web Audio synthesis engine. All sounds are generated procedurally —
 * no recorded/copyrighted samples — to evoke period-correct electromechanical
 * Japanese automotive chimes without reproducing any specific recording.
 */

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let duckGain: GainNode | null = null

let masterVolume = 0.7
let warningVolume = 0.85
let soundEnabled = true

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
    masterGain = ctx.createGain()
    masterGain.gain.value = masterVolume
    duckGain = ctx.createGain()
    duckGain.gain.value = 1
    duckGain.connect(masterGain)
    masterGain.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') {
    void ctx.resume()
  }
  return ctx
}

export function configureAudio(opts: { masterVolume?: number; warningVolume?: number; soundEnabled?: boolean }) {
  if (opts.masterVolume !== undefined) {
    masterVolume = opts.masterVolume
    if (masterGain) masterGain.gain.value = masterVolume
  }
  if (opts.warningVolume !== undefined) warningVolume = opts.warningVolume
  if (opts.soundEnabled !== undefined) soundEnabled = opts.soundEnabled
}

function envGain(startVal: number, node: GainNode, ac: AudioContext) {
  node.gain.setValueAtTime(startVal, ac.currentTime)
  return node
}

function tone(
  freq: number,
  duration: number,
  opts: {
    type?: OscillatorType
    gain?: number
    delay?: number
    attack?: number
    release?: number
    detune?: number
    connectTo?: AudioNode
  } = {}
) {
  const ac = getCtx()
  const osc = ac.createOscillator()
  osc.type = opts.type ?? 'sine'
  osc.frequency.value = freq
  if (opts.detune) osc.detune.value = opts.detune

  const gainNode = ac.createGain()
  const startTime = ac.currentTime + (opts.delay ?? 0)
  const attack = opts.attack ?? 0.008
  const release = opts.release ?? 0.05
  const peak = opts.gain ?? 0.2

  gainNode.gain.setValueAtTime(0, startTime)
  gainNode.gain.linearRampToValueAtTime(peak, startTime + attack)
  gainNode.gain.setValueAtTime(peak, Math.max(startTime + attack, startTime + duration - release))
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration)

  osc.connect(gainNode)
  gainNode.connect(opts.connectTo ?? duckGain!)

  osc.start(startTime)
  osc.stop(startTime + duration + 0.02)
  return osc
}

function withVolumeGate(volume: number, fn: () => void) {
  if (!soundEnabled) return
  try {
    getCtx()
    fn()
    void volume
  } catch {
    // AudioContext unavailable (e.g. no user gesture yet); fail silently.
  }
}

export function startupChime() {
  withVolumeGate(masterVolume, () => {
    tone(523.25, 0.16, { type: 'square', gain: 0.16, delay: 0 })
    tone(659.25, 0.16, { type: 'square', gain: 0.16, delay: 0.14 })
    tone(783.99, 0.28, { type: 'square', gain: 0.18, delay: 0.28 })
  })
}

export function shutdownChime() {
  withVolumeGate(masterVolume, () => {
    tone(783.99, 0.14, { type: 'square', gain: 0.16, delay: 0 })
    tone(659.25, 0.14, { type: 'square', gain: 0.16, delay: 0.12 })
    tone(523.25, 0.24, { type: 'square', gain: 0.14, delay: 0.24 })
  })
}

export function infoChime() {
  withVolumeGate(masterVolume, () => {
    tone(880, 0.09, { type: 'sine', gain: 0.14 })
  })
}

export function warningChime() {
  withVolumeGate(warningVolume, () => {
    tone(660, 0.12, { type: 'triangle', gain: 0.2, delay: 0 })
    tone(660, 0.12, { type: 'triangle', gain: 0.2, delay: 0.22 })
  })
}

export function criticalAlarm() {
  withVolumeGate(warningVolume, () => {
    const ac = getCtx()
    for (let i = 0; i < 3; i++) {
      tone(1046.5, 0.1, { type: 'square', gain: 0.24, delay: i * 0.2, attack: 0.004, release: 0.02 })
      tone(830.6, 0.1, { type: 'square', gain: 0.24, delay: i * 0.2 + 0.1, attack: 0.004, release: 0.02 })
    }
    void ac
  })
}

export function speedChime() {
  withVolumeGate(warningVolume, () => {
    tone(988, 0.1, { type: 'sine', gain: 0.18, delay: 0 })
    tone(988, 0.1, { type: 'sine', gain: 0.18, delay: 0.28 })
  })
}

export function connectionTone() {
  withVolumeGate(masterVolume, () => {
    tone(440, 0.06, { type: 'sine', gain: 0.1, delay: 0 })
    tone(660, 0.08, { type: 'sine', gain: 0.1, delay: 0.07 })
  })
}

export function duckMedia(duckTo: number, restoreAfterMs: number) {
  if (!duckGain) return
  const ac = getCtx()
  duckGain.gain.cancelScheduledValues(ac.currentTime)
  duckGain.gain.setValueAtTime(duckGain.gain.value, ac.currentTime)
  duckGain.gain.linearRampToValueAtTime(duckTo, ac.currentTime + 0.05)
  window.setTimeout(() => {
    if (!duckGain) return
    duckGain.gain.linearRampToValueAtTime(1, ac.currentTime + 0.3)
  }, restoreAfterMs)
}

export function unlockAudio() {
  try {
    getCtx()
  } catch {
    // ignore
  }
}
