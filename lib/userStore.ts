const USER_KEY = 'veesaa_user'

export interface VeesaaUser {
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

export function saveUser(user: VeesaaUser) {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser(): VeesaaUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as VeesaaUser) : null
  } catch {
    return null
  }
}

export function getDisplayName(user: VeesaaUser | null): string {
  if (!user) return 'You'
  return `${user.firstName} ${user.lastName}`.trim()
}

export function getInitials(user: VeesaaUser | null): string {
  if (!user) return '?'
  const f = user.firstName?.[0] ?? ''
  const l = user.lastName?.[0] ?? ''
  return (f + l).toUpperCase() || '?'
}
