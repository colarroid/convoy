export interface Country {
  code: string
  dial: string
  flag: string
  name: string
}

export const COUNTRY_CODES: Country[] = [
  { code: 'NG', dial: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: 'CA', dial: '+1',   flag: '🇨🇦', name: 'Canada' },
]

/** Split a stored full phone (e.g. "+2348012345678") into country + local digits. */
export function parsePhone(full?: string): { country: Country; local: string } {
  if (full) {
    // Match the longest dial code first so "+234" wins over "+2"
    const sorted = [...COUNTRY_CODES].sort((a, b) => b.dial.length - a.dial.length)
    for (const c of sorted) {
      if (full.startsWith(c.dial)) {
        return { country: c, local: full.slice(c.dial.length) }
      }
    }
  }
  return { country: COUNTRY_CODES[0], local: '' }
}
