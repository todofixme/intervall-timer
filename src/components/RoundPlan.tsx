import { cycleLength, effectiveWarn, formatMinSec, type Settings } from '../lib/timer'

/** Shows when each announcement happens within one round. */
export function RoundPlan({ settings }: { settings: Settings }) {
  const warn = effectiveWarn(settings)
  const steps = [
    { at: 0, label: '„Los“', borderClass: 'border-work' },
    ...(warn > 0 ? [{ at: settings.work - warn, label: `„Noch ${warn} Sek.“`, borderClass: 'border-warn' }] : []),
    { at: settings.work, label: '„Wechsel“', borderClass: 'border-pause' },
    { at: cycleLength(settings), label: 'nächste Runde', borderClass: 'border-line' },
  ]

  return (
    <div
      className="grid gap-1.5 text-center text-xs text-muted"
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      aria-label="Ablauf einer Runde"
    >
      {steps.map((s) => (
        <div key={s.label} className={`border-t-[3px] pt-1.5 ${s.borderClass}`}>
          <b className="block text-sm text-fg tabular-nums">{formatMinSec(s.at)}</b>
          {s.label}
        </div>
      ))}
    </div>
  )
}
