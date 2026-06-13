const USER_KEY = 'convoy_user'

export interface ConvoyUser {
  firstName: string
  lastName: string
  email: string
  phone?: string
  photoDataUrl?: string   // base64 data URL from selfie / upload
}

export function savePhoto(dataUrl: string) {
  const user = getUser()
  if (user) saveUser({ ...user, photoDataUrl: dataUrl })
}

export function saveUser(user: ConvoyUser) {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser(): ConvoyUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as ConvoyUser) : null
  } catch {
    return null
  }
}

export function getDisplayName(user: ConvoyUser | null): string {
  if (!user) return 'You'
  return `${user.firstName} ${user.lastName}`.trim()
}

export function getInitials(user: ConvoyUser | null): string {
  if (!user) return '?'
  const f = user.firstName?.[0] ?? ''
  const l = user.lastName?.[0] ?? ''
  return (f + l).toUpperCase() || '?'
}
