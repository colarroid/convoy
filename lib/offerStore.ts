const KEY = 'veesaa_offer_draft'

import type { TripDirection } from './trips'

export interface OfferDraft {
  communityCode?: string
  communityName?: string
  communityAddress?: string
  /** Which way the host is driving relative to the community. */
  direction?: TripDirection
  /** The member-side point: pickup going there, drop-off coming back. */
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
  /** Host is also driving back from the community on the same day. */
  returning?: boolean
  /** When the host leaves the community. Only used when `returning`. */
  returnTime?: string
  /** Seats on the return leg. Defaults to `seats` (same car). */
  returnSeats?: number
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
