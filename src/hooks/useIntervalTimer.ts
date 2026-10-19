import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CUE_PITCH, announce, stopSpeech, unlockAudio } from '../lib/audio'
import { FINISH_ANNOUNCEMENT, announcement, computeView, type Settings, type TimerView } from '../lib/timer'

export type Status = 'idle' | 'running' | 'paused' | 'finished'

const TICK_MS = 100

/**
 * Drives the timer. Time is measured against Date.now(), so a delayed tick
 * never makes the timer drift – it just updates a little later.
 */
export function useIntervalTimer(settings: Settings) {
  const [status, setStatus] = useState<Status>('idle')
  const [elapsed, setElapsed] = useState(0)

  const startAt = useRef(0)
  const pausedAt = useRef(0)
  const lastCue = useRef('')
  const settingsRef = useRef(settings)
  useLayoutEffect(() => {
    settingsRef.current = settings
  }, [settings])

  const view: TimerView = computeView(elapsed, settings)

  useEffect(() => {
    if (status !== 'running') return
    const tick = () => {
      const s = settingsRef.current
      const e = (Date.now() - startAt.current) / 1000
      const v = computeView(e, s)

      // The finished view has its own cueKey, so "Fertig" is spoken only once
      // even if another tick fires before the interval is cleared.
      if (v.cueKey !== lastCue.current) {
        lastCue.current = v.cueKey
        if (v.finished) announce(FINISH_ANNOUNCEMENT, CUE_PITCH.finish)
        else announce(announcement(v.segment, s), CUE_PITCH[v.segment])
      }
      setElapsed(e)
      if (v.finished) setStatus('finished')
    }
    tick()
    const id = window.setInterval(tick, TICK_MS)
    return () => window.clearInterval(id)
  }, [status])

  /** Start or resume. Call from a click handler (iOS audio unlock). */
  const start = useCallback(() => {
    unlockAudio()
    if (status === 'paused') {
      // Don't repeat the cue of the segment we paused in.
      lastCue.current = computeView(pausedAt.current, settingsRef.current).cueKey
      startAt.current = Date.now() - pausedAt.current * 1000
    } else {
      lastCue.current = ''
      startAt.current = Date.now()
      setElapsed(0)
    }
    setStatus('running')
  }, [status])

  const pause = useCallback(() => {
    pausedAt.current = (Date.now() - startAt.current) / 1000
    setElapsed(pausedAt.current)
    stopSpeech()
    setStatus('paused')
  }, [])

  const reset = useCallback(() => {
    stopSpeech()
    pausedAt.current = 0
    lastCue.current = ''
    setElapsed(0)
    setStatus('idle')
  }, [])

  return { status, view, start, pause, reset }
}
