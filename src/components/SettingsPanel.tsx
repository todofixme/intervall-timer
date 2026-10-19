import { useId, useState } from 'react'
import { LIMITS, effectiveWarn, type Settings } from '../lib/timer'

interface Props {
  settings: Settings
  onChange: (settings: Settings) => void
}

export function SettingsPanel({ settings, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const set = (key: keyof Settings) => (value: number) => onChange({ ...settings, [key]: value })
  const warn = effectiveWarn(settings)

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3 font-semibold"
      >
        <span>Einstellungen</span>
        <span className={`text-muted transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <section id={panelId} className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-4">
          <Slider
            label="Belastungsdauer"
            value={settings.work}
            display={`${settings.work} s`}
            limits={LIMITS.work}
            accent="var(--work)"
            textClass="text-work"
            onChange={set('work')}
          />
          <Slider
            label="Hinweis vor Ablauf"
            value={settings.warn}
            display={settings.warn === 0 ? 'aus' : `${warn} s`}
            limits={{ ...LIMITS.warn, max: Math.min(LIMITS.warn.max, settings.work - 1) }}
            accent="var(--warn)"
            textClass="text-warn"
            onChange={set('warn')}
          />
          <Slider
            label="Pause"
            value={settings.pause}
            display={`${settings.pause} s`}
            limits={LIMITS.pause}
            accent="var(--pause)"
            textClass="text-pause"
            onChange={set('pause')}
          />
          <p className="m-0 text-[13px] text-muted">
            Hinweis auf 0 schaltet die Ansage aus. Eine Änderung setzt den laufenden Timer zurück.
          </p>
        </section>
      )}
    </div>
  )
}

interface SliderProps {
  label: string
  value: number
  display: string
  limits: { min: number; max: number; step: number }
  accent: string
  textClass: string
  onChange: (value: number) => void
}

function Slider({ label, value, display, limits, accent, textClass, onChange }: SliderProps) {
  const id = useId()
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="font-semibold">
          {label}
        </label>
        <output htmlFor={id} className={`font-display text-2xl font-extrabold tabular-nums ${textClass}`}>
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={limits.min}
        max={limits.max}
        step={limits.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="m-0 h-7 w-full"
        style={{ accentColor: accent }}
      />
    </div>
  )
}
