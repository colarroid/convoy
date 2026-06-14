export interface Country {
  code: string
  dial: string
  flag: string
  name: string
  /** Example local number, shown as the phone-input placeholder. */
  example: string
}

export const COUNTRY_CODES: Country[] = [
  { code: 'NG', dial: '+234', flag: '🇳🇬', name: 'Nigeria', example: '8012345678' },
  { code: 'CA', dial: '+1',   flag: '🇨🇦', name: 'Canada',  example: '4161234567' },
]

/** Country codes (ISO-3166-1 alpha-2, lowercase) we bias Google Places to. */
export const PLACES_COUNTRIES = ['ng', 'ca']

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
