import { useEffect, useState } from 'react'
import { ProgressRing } from './components/ProgressRing'
import { RoundPlan } from './components/RoundPlan'
import { RoundsStepper } from './components/RoundsStepper'
import { SettingsPanel } from './components/SettingsPanel'
import { useIntervalTimer } from './hooks/useIntervalTimer'
import { useWakeLock } from './hooks/useWakeLock'
import { loadSettings, saveSettings } from './lib/storage'
import { effectiveWarn, isLastRound, type Segment, type Settings } from './lib/timer'

const SEGMENT_STYLE: Record<Segment, { stroke: string; text: string }> = {
  work: { stroke: 'stroke-work', text: 'text-work' },
  warn: { stroke: 'stroke-warn', text: 'text-warn' },
  pause: { stroke: 'stroke-pause', text: 'text-pause' },
}

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const { status, view, start, pause, reset } = useIntervalTimer(settings)
  const wakeLockDenied = useWakeLock(status === 'running')

  useEffect(() => saveSettings(settings), [settings])

  // Changing work/warn/pause resets the timer; changing rounds does not.
  const changeTiming = (next: Settings) => {
    setSettings(next)
    reset()
  }

  // A finished workout would show a wrong summary for the new round count.
  const changeRounds = (rounds: number) => {
    setSettings({ ...settings, rounds })
    if (status === 'finished') reset()
  }

  const style = status === 'running' ? SEGMENT_STYLE[view.segment] : { stroke: 'stroke-muted', text: 'text-muted' }

  const phaseLabel = {
    idle: 'Bereit',
    paused: 'Angehalten',
    finished: 'Fertig',
    running:
      view.segment === 'work'
        ? 'Belastung'
        : view.segment === 'warn'
          ? `Letzte ${effectiveWarn(settings)} Sekunden`
          : 'Wechsel',
  }[status]

  const hint = {
    idle: 'Start drücken',
    paused: 'Weiter mit Start',
    finished: settings.rounds === 1 ? '1 Runde geschafft' : `${settings.rounds} Runden geschafft`,
    running:
      view.segment === 'pause'
        ? isLastRound(view.round + 1, settings)
          ? 'gleich: letzte Runde'
          : 'gleich: Los'
        : isLastRound(view.round, settings)
          ? 'letzte Runde'
          : `danach ${settings.pause} s Pause`,
  }[status]

  return (
    <main className="mx-auto box-border flex min-h-full max-w-[440px] flex-col gap-5 px-4 py-5">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="m-0 font-display text-[28px] font-extrabold tracking-wide tabular-nums">
          Intervall {settings.work}/{settings.pause}
        </h1>
        <span className="font-semibold text-muted tabular-nums">
          Runde {view.round + 1}
          {settings.rounds > 0 && ` / ${settings.rounds}`}
        </span>
      </header>

      <ProgressRing progress={status === 'idle' ? 0 : view.progress} strokeClass={style.stroke}>
        <div className={`text-center text-sm font-semibold uppercase tracking-[0.14em] ${style.text}`}>{phaseLabel}</div>
        <div className="font-display text-[clamp(96px,34vw,150px)] leading-[0.9] font-extrabold tabular-nums">
          {status === 'finished' ? '✓' : status === 'idle' ? settings.work : view.secondsLeft}
        </div>
        <div className="text-sm text-muted">{hint}</div>
      </ProgressRing>

      <RoundPlan settings={settings} />

      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={status === 'running' ? pause : start}
          className="flex-1 rounded-2xl border border-fg bg-fg p-4 text-lg font-semibold text-bg"
        >
          {status === 'running' ? 'Pause' : status === 'paused' ? 'Weiter' : 'Start'}
        </button>
        <button type="button" onClick={reset} className="rounded-2xl border border-line bg-surface p-4 font-semibold">
          Zurücksetzen
        </button>
      </div>

      <RoundsStepper value={settings.rounds} onChange={changeRounds} />

      <SettingsPanel settings={settings} onChange={changeTiming} />

      {wakeLockDenied ? (
        <p role="alert" className="m-0 text-[13px] leading-relaxed font-semibold text-warn">
          Das Display kann nicht wach gehalten werden. Bitte die automatische Sperre ausschalten, sonst verstummt der
          Timer.
        </p>
      ) : (
        <p className="m-0 text-[13px] leading-relaxed text-muted">
          Ton anlassen und Stummschalter am iPhone aus. Das Display bleibt während des Timers an.
        </p>
      )}
    </main>
  )
}
