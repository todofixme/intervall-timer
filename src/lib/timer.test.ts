import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SETTINGS,
  announcement,
  clampSettings,
  computeView,
  effectiveWarn,
  formatMinSec,
  isLastRound,
  totalDuration,
  type Settings,
} from './timer'

const s: Settings = { ...DEFAULT_SETTINGS } // 55 / 10 / 5, 10 rounds

describe('computeView', () => {
  it('starts in work with full time left', () => {
    const v = computeView(0, s)
    expect(v).toMatchObject({ round: 0, segment: 'work', secondsLeft: 55, finished: false })
  })

  it('switches to warn 10 s before the end of work', () => {
    expect(computeView(44.9, s).segment).toBe('work')
    expect(computeView(45, s).segment).toBe('warn')
    expect(computeView(45, s).secondsLeft).toBe(10)
  })

  it('switches to pause after work', () => {
    const v = computeView(55, s)
    expect(v).toMatchObject({ segment: 'pause', secondsLeft: 5 })
  })

  it('starts the next round after work + pause', () => {
    expect(computeView(60, s)).toMatchObject({ round: 1, segment: 'work' })
  })

  it('finishes right after the last work phase, without a trailing pause', () => {
    // 10 rounds × 60 s − 5 s final pause
    expect(totalDuration(s)).toBe(595)
    expect(computeView(594.9, s)).toMatchObject({ round: 9, segment: 'warn', finished: false })
    expect(computeView(595, s)).toMatchObject({ finished: true, cueKey: 'done' })
  })

  it('still pauses between rounds before the last one', () => {
    expect(computeView(535, s)).toMatchObject({ round: 8, segment: 'pause', finished: false })
  })

  it('tracks progress through the pause', () => {
    expect(computeView(55, s).progress).toBe(0)
    expect(computeView(57.5, s).progress).toBeCloseTo(0.5)
  })

  it('counts whole seconds down at segment boundaries', () => {
    expect(computeView(54.9, s)).toMatchObject({ segment: 'warn', secondsLeft: 1 })
    expect(computeView(55, s)).toMatchObject({ segment: 'pause', secondsLeft: 5 })
    expect(computeView(59.9, s)).toMatchObject({ segment: 'pause', secondsLeft: 1 })
  })

  it('uses the clamped warn time when warn exceeds work', () => {
    const short = { ...s, work: 10, warn: 30 }
    expect(computeView(0.5, short).segment).toBe('work')
    expect(computeView(1, short)).toMatchObject({ segment: 'warn', secondsLeft: 9 })
  })

  it('never finishes in endless mode', () => {
    expect(computeView(100_000, { ...s, rounds: 0 }).finished).toBe(false)
  })

  it('skips warn when warn is 0', () => {
    const noWarn = { ...s, warn: 0 }
    expect(computeView(54, noWarn).segment).toBe('work')
  })

  it('changes cueKey only on segment boundaries', () => {
    expect(computeView(1, s).cueKey).toBe(computeView(40, s).cueKey)
    expect(computeView(46, s).cueKey).not.toBe(computeView(40, s).cueKey)
  })
})

describe('helpers', () => {
  it('detects the last round', () => {
    expect(isLastRound(8, s)).toBe(false)
    expect(isLastRound(9, s)).toBe(true)
    expect(isLastRound(1_000, { ...s, rounds: 0 })).toBe(false)
  })

  it('keeps warn shorter than work', () => {
    expect(effectiveWarn({ ...s, work: 10, warn: 30 })).toBe(9)
  })

  it('builds the spoken texts', () => {
    expect(announcement('work', s)).toBe('Los')
    expect(announcement('warn', s)).toBe('Noch 10 Sekunden')
    expect(announcement('warn', { ...s, warn: 1 })).toBe('Noch 1 Sekunde')
    expect(announcement('pause', s)).toBe('Wechsel')
  })

  it('formats minutes and seconds', () => {
    expect(formatMinSec(45)).toBe('0:45')
    expect(formatMinSec(75)).toBe('1:15')
  })

  it('clamps invalid settings', () => {
    expect(clampSettings({ work: 999, pause: -3, warn: Number.NaN })).toEqual({
      ...DEFAULT_SETTINGS,
      work: 180,
      pause: 1,
    })
  })
})
