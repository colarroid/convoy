import type { TripDirection } from './trips'

const KEY = 'veesaa_find_draft'

export interface FindDraft {
  communityCode?: string
  communityName?: string
  communityAddress?: string
  communityArea?: string
  /** Which way the rider is going relative to the community. */
  direction?: TripDirection
  /** The member-side point: where to pick you up, or where you want dropping. */
  startingPlace?: string
  /** Neighbourhood-level name from Places, for aggregate area stats. */
  startLocality?: string
  startLat?: number
  startLng?: number
  selectedRideId?: string
}

export function getFindDraft(): FindDraft {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function saveFindDraft(patch: Partial<FindDraft>) {
  const current = getFindDraft()
  sessionStorage.setItem(KEY, JSON.stringify({ ...current, ...patch }))
}

export function clearFindDraft() {
  sessionStorage.removeItem(KEY)
}
