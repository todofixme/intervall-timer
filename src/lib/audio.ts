/**
 * Sound output: a short beep (Web Audio) plus German speech (Web Speech API).
 *
 * iOS only allows audio after a user gesture, so call `unlockAudio()`
 * directly inside the Start button's click handler.
 */

let ctx: AudioContext | null = null
let voice: SpeechSynthesisVoice | null = null

const hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window

function pickVoice() {
  const voices = speechSynthesis.getVoices()
  voice = voices.find((v) => v.lang === 'de-DE') ?? voices.find((v) => v.lang?.startsWith('de')) ?? null
}

if (hasSpeech) {
  pickVoice()
  speechSynthesis.addEventListener('voiceschanged', pickVoice)
}

export function beep(frequency: number, durationMs = 180) {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx ??= new AC()
    // iOS suspends the context after calls, Siri or app switches.
    if (ctx.state !== 'running') void ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = frequency
    osc.connect(gain)
    gain.connect(ctx.destination)
    const now = ctx.currentTime
    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000)
    osc.start()
    osc.stop(now + durationMs / 1000)
  } catch {
    /* audio not available – speech may still work */
  }
}

export function speak(text: string) {
  if (!hasSpeech) return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'de-DE'
  if (voice) u.voice = voice
  u.rate = 1.05
  speechSynthesis.speak(u)
}

export function stopSpeech() {
  if (hasSpeech) speechSynthesis.cancel()
}

/** Must run inside a click/tap handler. */
export function unlockAudio() {
  beep(1, 10)
  if (hasSpeech) speechSynthesis.speak(new SpeechSynthesisUtterance(''))
  void ctx?.resume()
}

/** Beep pitch per cue, so you can tell them apart without speech. */
export const CUE_PITCH = { work: 880, warn: 660, pause: 520, finish: 990 } as const

export function announce(text: string, pitch: number) {
  beep(pitch)
  speak(text)
}
