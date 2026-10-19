import { LIMITS } from '../lib/timer'

interface Props {
  value: number
  onChange: (value: number) => void
}

const btn = 'w-12 rounded-2xl border border-line bg-surface py-2.5 text-xl font-semibold'

export function RoundsStepper({ value, onChange }: Props) {
  const { min, max } = LIMITS.rounds
  return (
    <div className="flex items-center justify-between gap-2.5">
      <span className="text-muted" id="rounds-label">
        Runden
      </span>
      <div className="flex items-center gap-2" role="group" aria-labelledby="rounds-label">
        <button type="button" className={btn} aria-label="Weniger Runden" onClick={() => onChange(Math.max(min, value - 1))}>
          −
        </button>
        <output className="min-w-[3ch] text-center text-lg font-semibold tabular-nums">{value === 0 ? '∞' : value}</output>
        <button type="button" className={btn} aria-label="Mehr Runden" onClick={() => onChange(Math.min(max, value + 1))}>
          +
        </button>
      </div>
    </div>
  )
}
