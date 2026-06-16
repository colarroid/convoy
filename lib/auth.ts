import { supabase } from './supabase'
import { saveUser } from './userStore'

/**
 * Pull the signed-in user's profile from Supabase and mirror it into the
 * local cache that the UI (AppNav, profile, review) currently reads.
 * Bridges real auth with the existing localStorage-based display layer.
 */
export async function syncProfileToCache() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, phone, photo_url')
    .eq('id', user.id)
    .single()

  saveUser({
    firstName: profile?.first_name ?? '',
    lastName: profile?.last_name ?? '',
    email: user.email ?? '',
    phone: profile?.phone ?? undefined,
    photoDataUrl: profile?.photo_url ?? undefined,
  })

  // Mirror onboarding state for the gate (photo present = onboarded).
  if (typeof window !== 'undefined') {
    if (profile?.photo_url) localStorage.setItem('convoy_onboarded', '1')
    else localStorage.removeItem('convoy_onboarded')
  }

  return profile
}

/**
 * Start Google OAuth. Google returns the user to /onboarding/google, which
 * completes their profile (phone + selfie) if needed, or sends them home.
 */
export async function signInWithGoogle() {
  const redirectTo = `${window.location.origin}/onboarding/google`
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })
  if (error) throw error
}

export async function signOut() {
  const { unlinkOneSignal } = await import('./onesignalClient')
  unlinkOneSignal()
  await supabase.auth.signOut()
  if (typeof window !== 'undefined') {
    localStorage.removeItem('convoy_user')
    localStorage.removeItem('convoy_onboarded')
  }
}
