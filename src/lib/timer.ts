/**
 * Pure timer logic. No React, no browser APIs – easy to test.
 *
 * One round:
 *   0 s                → "Los"            (segment "work")
 *   work - warn s      → "Noch X Sekunden" (segment "warn")
 *   work s             → "Wechsel"        (segment "pause")
 *   work + pause s     → next round
 *
 * The last round ends right after work with "Fertig" – no trailing pause.
 */

export interface Settings {
  /** Belastungsdauer in Sekunden */
  work: number
  /** Hinweis vor Ablauf der Belastung in Sekunden (0 = aus) */
  warn: number
  /** Pause in Sekunden */
  pause: number
  /** Anzahl Runden (0 = endlos) */
  rounds: number
}

export const DEFAULT_SETTINGS: Settings = { work: 55, warn: 10, pause: 5, rounds: 10 }

export const LIMITS = {
  work: { min: 10, max: 180, step: 5 },
  warn: { min: 0, max: 30, step: 1 },
  pause: { min: 1, max: 60, step: 1 },
  rounds: { min: 0, max: 99, step: 1 },
} as const satisfies Record<keyof Settings, { min: number; max: number; step: number }>

export type Segment = 'work' | 'warn' | 'pause'

export interface TimerView {
  /** 0-based round index */
  round: number
  segment: Segment
  /** Whole seconds left in the current phase (work incl. warn, or pause) */
  secondsLeft: number
  /** 0..1 progress through the current phase */
  progress: number
  /** True once all rounds are done (never for endless mode) */
  finished: boolean
  /** Changes exactly when a new announcement is due, e.g. "3:warn" */
  cueKey: string
}

/** Warn time actually used: always shorter than the work phase. */
export function effectiveWarn(s: Settings): number {
  return Math.max(0, Math.min(s.warn, s.work - 1))
}

export function cycleLength(s: Settings): number {
  return s.work + s.pause
}

/** Total duration in seconds (without a pause after the last round), or null for endless mode. */
export function totalDuration(s: Settings): number | null {
  return s.rounds > 0 ? s.rounds * cycleLength(s) - s.pause : null
}

/** True if `round` (0-based) is the last one. Never true in endless mode. */
export function isLastRound(round: number, s: Settings): boolean {
  return s.rounds > 0 && round + 1 >= s.rounds
}

export function computeView(elapsed: number, s: Settings): TimerView {
  const cycle = cycleLength(s)
  const total = totalDuration(s)
  if (total !== null && elapsed >= total) {
    return { round: s.rounds - 1, segment: 'pause', secondsLeft: 0, progress: 1, finished: true, cueKey: 'done' }
  }

  const round = Math.floor(elapsed / cycle)
  const t = elapsed - round * cycle
  const warn = effectiveWarn(s)
  const warnAt = s.work - warn

  let segment: Segment
  let left: number
  let progress: number
  if (t < s.work) {
    segment = warn > 0 && t >= warnAt ? 'warn' : 'work'
    left = s.work - t
    progress = t / s.work
  } else {
    segment = 'pause'
    left = cycle - t
    progress = (t - s.work) / s.pause
  }

  return {
    round,
    segment,
    secondsLeft: Math.ceil(left - 1e-6),
    progress,
    finished: false,
    cueKey: `${round}:${segment}`,
  }
}

/** What gets spoken when a segment starts. */
export function announcement(segment: Segment, s: Settings): string {
  switch (segment) {
    case 'work':
      return 'Los'
    case 'warn': {
      const w = effectiveWarn(s)
      return w === 1 ? 'Noch 1 Sekunde' : `Noch ${w} Sekunden`
    }
    case 'pause':
      return 'Wechsel'
  }
}

export const FINISH_ANNOUNCEMENT = 'Fertig. Gut gemacht'

/** 75 → "1:15" */
export function formatMinSec(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export function clampSettings(s: Partial<Settings>): Settings {
  const out = { ...DEFAULT_SETTINGS }
  for (const key of Object.keys(LIMITS) as (keyof Settings)[]) {
    const v = s[key]
    if (typeof v === 'number' && Number.isFinite(v)) {
      out[key] = Math.round(Math.min(LIMITS[key].max, Math.max(LIMITS[key].min, v)))
    }
  }
  return out
}
