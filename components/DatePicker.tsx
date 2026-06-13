'use client'

import { useState, useRef, useEffect } from 'react'

interface DatePickerProps {
  value: string        // YYYY-MM-DD or ''
  min?: string         // YYYY-MM-DD
  onChange: (val: string) => void
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa']

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function isoToDisplay(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
}

// Year range: current year to +5 years
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear + i)

export default function DatePicker({ value, min, onChange }: DatePickerProps) {
  const today = new Date()
  const minDate = min ? new Date(min) : today

  const parsed = value
    ? new Date(Number(value.split('-')[0]), Number(value.split('-')[1]) - 1, Number(value.split('-')[2]))
    : null

  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth())
  const [pending, setPending] = useState(value) // temp selection before Done
  const [showMonthDrop, setShowMonthDrop] = useState(false)
  const [showYearDrop, setShowYearDrop] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const isDisabled = (day: number) => {
    const d = new Date(viewYear, viewMonth, day)
    d.setHours(0, 0, 0, 0)
    const m = new Date(minDate)
    m.setHours(0, 0, 0, 0)
    return d < m
  }

  const isPending = (day: number) => {
    if (!pending) return false
    const [py, pm, pd] = pending.split('-').map(Number)
    return py === viewYear && pm - 1 === viewMonth && pd === day
  }

  const selectDay = (day: number) => {
    if (isDisabled(day)) return
    const y = viewYear
    const m = String(viewMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    setPending(`${y}-${m}-${d}`)
  }

  const handleDone = () => {
    if (pending) onChange(pending)
    setOpen(false)
  }

  const handleClose = () => {
    setPending(value) // revert
    setOpen(false)
  }

  const totalDays = daysInMonth(viewYear, viewMonth)
  const firstDay  = firstDayOfMonth(viewYear, viewMonth)
  const cells     = Array.from({ length: firstDay + totalDays }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  )

  return (
    <div ref={containerRef} className="relative mb-8">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all text-left
          ${value
            ? 'border-black bg-white'
            : 'border-gray-200 bg-gray-50 hover:border-gray-400'
          } ${open ? 'border-black bg-white' : ''}`}
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <span className={`text-sm ${value ? 'font-semibold text-black' : 'text-gray-400'}`}>
            {value ? isoToDisplay(value) : 'Select a date'}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Calendar dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="p-4">
            {/* Month / Year header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={prevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                {/* Month dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setShowMonthDrop(v => !v); setShowYearDrop(false) }}
                    className="flex items-center gap-1 text-base font-bold text-black hover:text-gray-600 transition-colors"
                  >
                    {MONTHS[viewMonth]}
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showMonthDrop && (
                    <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                      {MONTHS.map((m, i) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => { setViewMonth(i); setShowMonthDrop(false) }}
                          className={`w-full px-3 py-2 text-left text-sm transition-colors
                            ${i === viewMonth ? 'bg-black text-white font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Year dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setShowYearDrop(v => !v); setShowMonthDrop(false) }}
                    className="flex items-center gap-1 text-base font-bold text-black hover:text-gray-600 transition-colors"
                  >
                    {viewYear}
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showYearDrop && (
                    <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                      {YEARS.map(y => (
                        <button
                          key={y}
                          type="button"
                          onClick={() => { setViewYear(y); setShowYearDrop(false) }}
                          className={`w-full px-3 py-2 text-left text-sm transition-colors
                            ${y === viewYear ? 'bg-black text-white font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={nextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {cells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />

                const disabled = isDisabled(day)
                const selected = isPending(day)
                const isToday  = !selected &&
                  day === today.getDate() &&
                  viewMonth === today.getMonth() &&
                  viewYear === today.getFullYear()

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={disabled}
                    onClick={() => selectDay(day)}
                    className={`
                      mx-auto w-9 h-9 flex items-center justify-center rounded-full text-sm transition-all
                      ${disabled  ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'}
                      ${selected  ? 'bg-black text-white font-semibold hover:bg-gray-800' : ''}
                      ${isToday   ? 'border-2 border-black font-semibold text-black' : ''}
                      ${!disabled && !selected && !isToday ? 'text-gray-800' : ''}
                    `}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDone}
              disabled={!pending}
              className="px-5 py-2 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 active:scale-[0.97] transition-all disabled:opacity-40"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
