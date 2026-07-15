const KEY = 'veesaa_find_draft'

export interface FindDraft {
  communityCode?: string
  communityName?: string
  communityAddress?: string
  communityArea?: string
  startingPlace?: string
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
