// "Add to calendar", generate an .ics with a built-in alarm so the user's own
// calendar app fires the reminder (OS-native, doesn't depend on push/PWA install).

function toICSDate(d: Date): string {
  // → YYYYMMDDTHHMMSSZ (UTC)
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

/** Resolve a trip's start instant from departs_at, or from depart_date + "h:mm AM/PM". */
export function tripStart(departsAt: string | null, departDate?: string, departTime?: string): Date | null {
  if (departsAt) return new Date(departsAt)
  if (departDate && departTime) {
    const m = departTime.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (m) {
      let h = parseInt(m[1], 10)
      const min = parseInt(m[2], 10)
      const ap = m[3].toUpperCase()
      if (ap === 'PM' && h !== 12) h += 12
      if (ap === 'AM' && h === 12) h = 0
      const [y, mo, d] = departDate.split('-').map(Number)
      return new Date(y, mo - 1, d, h, min)
    }
  }
  return null
}

export function buildTripICS(opts: {
  uid: string
  title: string
  description?: string
  location?: string
  start: Date
  durationMinutes?: number
  alarmMinutesBefore?: number
}): string {
  const dur = opts.durationMinutes ?? 60
  const alarm = opts.alarmMinutesBefore ?? 30
  const end = new Date(opts.start.getTime() + dur * 60000)
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Veesaa//Ride//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${opts.uid}`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(opts.start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${esc(opts.title)}`,
    ...(opts.description ? [`DESCRIPTION:${esc(opts.description)}`] : []),
    ...(opts.location ? [`LOCATION:${esc(opts.location)}`] : []),
    'BEGIN:VALARM',
    `TRIGGER:-PT${alarm}M`,
    'ACTION:DISPLAY',
    'DESCRIPTION:Ride reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

/** Trigger a download of the .ics (opens in the user's calendar app). */
export function downloadICS(filename: string, ics: string) {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
