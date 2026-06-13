'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { linkOneSignal } from '@/lib/onesignalClient'

// Routes anyone can see without a session.
const PUBLIC_ROUTES = new Set([
  '/', '/login', '/signup', '/verify', '/forgot-password', '/reset-password',
  '/help', '/terms-of-use', '/privacy',
])
const ONBOARDING = '/onboarding/photo'
const ONBOARDED_KEY = 'convoy_onboarded'

/**
 * Enforces two things on every route:
 *  1. Unauthenticated users can't reach protected pages → /login
 *  2. Authenticated users who haven't completed the (compulsory) selfie step
 *     are sent to /onboarding/photo before they can use the platform.
 *
 * "Completed" = their profile has a photo_url. Cached in localStorage once
 * true so we don't re-query on every navigation.
 */
export default function AuthGate() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let active = true

    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!active) return
      const user = session?.user

      // ── Not signed in ──
      if (!user) {
        if (!PUBLIC_ROUTES.has(pathname) && pathname !== ONBOARDING) {
          router.replace('/login')
        }
        return
      }

      // Associate this device's push subscription with the user.
      linkOneSignal(user.id)

      // ── Signed in: onboarded already? (never reverts once true) ──
      if (localStorage.getItem(ONBOARDED_KEY) === '1') return

      const { data: profile } = await supabase
        .from('profiles')
        .select('photo_url')
        .eq('id', user.id)
        .single()
      if (!active) return

      if (profile?.photo_url) {
        localStorage.setItem(ONBOARDED_KEY, '1')
      } else if (pathname !== ONBOARDING) {
        router.replace(ONBOARDING)
      }
    }

    check()
    // Re-run when auth state settles (e.g. session parsed from a magic link URL)
    const { data: sub } = supabase.auth.onAuthStateChange(() => check())
    return () => { active = false; sub.subscription.unsubscribe() }
  }, [pathname, router])

  return null
}
