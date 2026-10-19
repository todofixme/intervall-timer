import { DEFAULT_SETTINGS, clampSettings, type Settings } from './timer'

const KEY = 'intervall-timer:settings'

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? clampSettings(JSON.parse(raw) as Partial<Settings>) : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* private mode or storage blocked – settings just won't persist */
  }
}
