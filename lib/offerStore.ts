const KEY = 'veesaa_offer_draft'

export interface OfferDraft {
  communityCode?: string
  communityName?: string
  communityAddress?: string
  pickupPlace?: string
  pickupNote?: string
  pickupLat?: number
  pickupLng?: number
  date?: string        // ISO date string YYYY-MM-DD
  time?: string        // e.g. "08:00 AM"
  vehicleMake?: string
  vehicleModel?: string
  plateNumber?: string
  color?: string
  unknownVehicle?: boolean
  seats?: number
}

export function getDraft(): OfferDraft {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function saveDraft(patch: Partial<OfferDraft>) {
  const current = getDraft()
  sessionStorage.setItem(KEY, JSON.stringify({ ...current, ...patch }))
}

export function clearDraft() {
  sessionStorage.removeItem(KEY)
}
