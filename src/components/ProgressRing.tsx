import type { ReactNode } from 'react'

const R = 54
const CIRCUMFERENCE = 2 * Math.PI * R

interface Props {
  /** 0..1 */
  progress: number
  /** Tailwind stroke class, e.g. "stroke-work" */
  strokeClass: string
  children: ReactNode
}

export function ProgressRing({ progress, strokeClass, children }: Props) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[340px]">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={R} fill="none" strokeWidth="10" className="stroke-line" />
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * progress}
          className={`transition-[stroke] duration-300 motion-reduce:transition-none ${strokeClass}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">{children}</div>
    </div>
  )
}
