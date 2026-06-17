'use client'

import { buildTripICS, downloadICS } from '@/lib/calendar'

interface AddToCalendarProps {
  uid: string
  title: string
  start: Date
  description?: string
  location?: string
  className?: string
}

/** Small "Add to calendar" button — downloads an .ics with a 30-min reminder alarm. */
export default function AddToCalendar({ uid, title, start, description, location, className }: AddToCalendarProps) {
  const handle = () => {
    const ics = buildTripICS({ uid, title, start, description, location })
    downloadICS('veesaa-ride.ics', ics)
  }

  return (
    <button
      type="button"
      onClick={handle}
      className={className ?? 'inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-black transition-colors shrink-0'}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0V11.25A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
      Add to calendar
    </button>
  )
}
