import { useEffect, useState } from 'react'

/**
 * Keeps the screen on while `active` is true (if the browser allows it).
 * Returns true while active but the lock could not be acquired.
 */
export function useWakeLock(active: boolean): boolean {
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false

    const request = async () => {
      try {
        const l = await navigator.wakeLock.request('screen')
        if (cancelled) {
          void l.release()
          return
        }
        // Overlapping requests (initial + visibilitychange) must not leak a lock.
        void lock?.release()
        lock = l
        setDenied(false)
      } catch {
        if (!cancelled) setDenied(true)
      }
    }
    // The lock is dropped when the page is hidden; re-request on return.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void request()
    }

    void request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      void lock?.release()
      setDenied(false)
    }
  }, [active])

  return active && (denied || !('wakeLock' in navigator))
}
