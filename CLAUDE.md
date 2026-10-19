# CLAUDE.md

Context for Claude Code when working on this repository.

## What this is

A talking interval timer for workouts, used mainly on an iPhone home screen (PWA). One round = work phase → optional warning before the end of work → pause. The last round has no pause: „Fertig“ comes right after its work phase. Spoken cues in German: „Los“, „Noch X Sekunden“, „Wechsel“, at the end „Fertig. Gut gemacht“.

The UI language is **German**. Keep all user-facing text German; code, comments and identifiers stay English.

## Commands

```bash
npm run dev        # dev server
npm test           # vitest (run once)
npm run typecheck  # tsc without emitting
npm run build      # tsc -b && vite build (also generates the service worker)
```

Before finishing a change, run `npm test` and `npm run build`. Both must pass.

## Architecture

- `src/lib/timer.ts` – **all timing logic**, pure functions only. `computeView(elapsed, settings)` returns round, segment (`work` | `warn` | `pause`), seconds left, progress, `finished` and a `cueKey`. A new announcement is due exactly when `cueKey` changes. `announcement()` builds the spoken text. Settings limits live in `LIMITS`; `clampSettings()` enforces them.
- `src/lib/timer.test.ts` – tests for the above. Add or update tests whenever timing behavior changes.
- `src/hooks/useIntervalTimer.ts` – state machine `idle → running ⇄ paused → finished`. Elapsed time is computed from `Date.now()` minus a start timestamp, never by counting ticks, so the timer does not drift. Ticks every 100 ms.
- `src/lib/audio.ts` – beep (Web Audio) + speech (Web Speech API, prefers a `de-DE` voice). `unlockAudio()` must be called synchronously inside a click handler, otherwise iOS stays silent.
- `src/hooks/useWakeLock.ts` – keeps the screen on while running and re-requests the lock after the page becomes visible again.
- `src/lib/storage.ts` – settings in `localStorage` under `intervall-timer:settings`. Always wrapped in try/catch.
- `src/components/` – presentational components. `App.tsx` wires everything together.

## Styling

- Tailwind CSS 4 via `@tailwindcss/vite`. No `tailwind.config.js`; the theme is defined in `src/index.css` with `@theme inline`.
- Colors are CSS variables with light values on `:root` and dark values under `prefers-color-scheme: dark`. Use the semantic Tailwind colors: `bg-bg`, `text-fg`, `text-muted`, `border-line`, `bg-surface`, and the phase colors `work`, `warn`, `pause` (e.g. `stroke-work`, `text-warn`). Do not hard-code hex colors in components.
- Fonts are bundled with `@fontsource` (Big Shoulders Display for numbers/headings, Instrument Sans for text) so the app works offline. Do not switch to Google Fonts links.
- Mobile first: max width 440 px, digits use `tabular-nums`.

## Conventions

- TypeScript strict mode; no `any`.
- Keep timing rules in `lib/timer.ts`, not in components or hooks.
- Browser APIs (speech, wake lock, storage) can be missing or throw. Fail silently; the timer must keep running.
- Changing work, warn or pause resets a running timer; changing the number of rounds does not.
- PWA config is in `vite.config.ts`. If you add static assets that must work offline, make sure `workbox.globPatterns` covers them.

## Ideas for later

- Several saved presets (e.g. „55/5“, „Tabata 20/10“)
- Different cue texts per phase, editable in the settings
- Vibration on Android (`navigator.vibrate`, not supported on iOS)
- Warm-up and cool-down phases
