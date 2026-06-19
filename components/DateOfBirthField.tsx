'use client'

import { useState } from 'react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function daysInMonth(month: number, year: number) {
  if (!month) return 31
  return new Date(year || 2000, month, 0).getDate()
}

/** Day / Month / Year selects, reliable for birthdates, no native date-picker quirks.
    Emits an ISO "YYYY-MM-DD" string (or "" until all three are set). */
export default function DateOfBirthField({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const init = value ? value.split('-').map(Number) : [0, 0, 0]
  const [year, setYear] = useState(init[0] || 0)
  const [month, setMonth] = useState(init[1] || 0)
  const [day, setDay] = useState(init[2] || 0)

  const now = new Date()
  const maxYear = now.getFullYear() - 13
  const minYear = now.getFullYear() - 100
  const years: number[] = []
  for (let y = maxYear; y >= minYear; y--) years.push(y)

  const emit = (d: number, m: number, y: number) =>
    onChange(d && m && y ? `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` : '')

  const onDay = (v: number) => { setDay(v); emit(v, month, year) }
  const onMonth = (v: number) => { const nd = day > daysInMonth(v, year) ? 0 : day; setMonth(v); setDay(nd); emit(nd, v, year) }
  const onYear = (v: number) => { const nd = day > daysInMonth(month, v) ? 0 : day; setYear(v); setDay(nd); emit(nd, month, v) }

  const cls = 'input-field flex-1 text-sm min-w-0'
  const dayCount = daysInMonth(month, year)

  return (
    <div className="flex gap-2">
      <select aria-label="Day" value={day} onChange={(e) => onDay(+e.target.value)} className={cls}>
        <option value={0}>Day</option>
        {Array.from({ length: dayCount }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
      <select aria-label="Month" value={month} onChange={(e) => onMonth(+e.target.value)} className={cls}>
        <option value={0}>Month</option>
        {MONTHS.map((mo, i) => <option key={mo} value={i + 1}>{mo}</option>)}
      </select>
      <select aria-label="Year" value={year} onChange={(e) => onYear(+e.target.value)} className={cls}>
        <option value={0}>Year</option>
        {years.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  )
}
