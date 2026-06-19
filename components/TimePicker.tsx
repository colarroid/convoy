'use client'

import { useEffect, useState } from 'react'

interface TimePickerProps {
  value: string   // "08:30 AM"
  onChange: (val: string) => void
}

const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function parse(value: string) {
  const [time, period] = (value || '08:00 AM').split(' ')
  const [h, m] = time.split(':').map(Number)
  return { hour: h || 8, minute: m || 0, period: (period as 'AM' | 'PM') || 'AM' }
}

function fmt(hour: number, minute: number, period: 'AM' | 'PM') {
  return `${pad(hour)}:${pad(minute)} ${period}`
}

// Defined outside the component, fixes the hydration mismatch
function Chevron({ dir, onClick }: { dir: 'up' | 'down'; onClick: () => void }) {
  const path = dir === 'up' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-500"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
      </svg>
    </button>
  )
}

export default function TimePicker({ value, onChange }: TimePickerProps) {
  const parsed = parse(value)
  const [hour, setHour] = useState(parsed.hour)
  const [minute, setMinute] = useState(parsed.minute)
  const [period, setPeriod] = useState<'AM' | 'PM'>(parsed.period)

  useEffect(() => {
    onChange(fmt(hour, minute, period))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hour, minute, period])

  const incHour = () => setHour(h => (h === 12 ? 1 : h + 1))
  const decHour = () => setHour(h => (h === 1 ? 12 : h - 1))

  const minuteIdx = MINUTES.indexOf(pad(minute))
  const incMin = () => setMinute(Number(MINUTES[(minuteIdx + 1) % MINUTES.length]))
  const decMin = () => setMinute(Number(MINUTES[(minuteIdx - 1 + MINUTES.length) % MINUTES.length]))

  return (
    <div className="flex items-center gap-2">
      {/* Hour */}
      <div className="flex flex-col items-center gap-1">
        <Chevron dir="up" onClick={incHour} />
        <div className="w-16 h-14 flex items-center justify-center rounded-xl border-2 border-black bg-white select-none">
          <span className="text-2xl font-bold text-black tabular-nums">{pad(hour)}</span>
        </div>
        <Chevron dir="down" onClick={decHour} />
        <span className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Hour</span>
      </div>

      <span className="text-2xl font-bold text-gray-300 pb-7">:</span>

      {/* Minute */}
      <div className="flex flex-col items-center gap-1">
        <Chevron dir="up" onClick={incMin} />
        <div className="w-16 h-14 flex items-center justify-center rounded-xl border-2 border-gray-200 bg-gray-50 select-none">
          <span className="text-2xl font-bold text-black tabular-nums">{pad(minute)}</span>
        </div>
        <Chevron dir="down" onClick={decMin} />
        <span className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Min</span>
      </div>

      {/* AM / PM */}
      <div className="flex flex-col gap-2 pb-7 ml-2">
        {(['AM', 'PM'] as const).map(p => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
              ${period === p
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
