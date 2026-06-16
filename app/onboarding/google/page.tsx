'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import Navbar from '@/components/Navbar'
import PhoneField from '@/components/PhoneField'
import { COUNTRY_CODES } from '@/lib/countries'
import { supabase } from '@/lib/supabase'
import { syncProfileToCache } from '@/lib/auth'
import { saveUser } from '@/lib/userStore'

type Stage = 'resolving' | 'form' | 'error'

/** Derive a first/last name from Google's OAuth metadata. */
function googleName(user: User): { first: string; last: string } {
  const md = (user.user_metadata ?? {}) as Record<string, string>
  const full = md.full_name || md.name || ''
  const first = md.given_name || full.split(' ')[0] || ''
  const last = md.family_name || full.split(' ').slice(1).join(' ') || ''
  return { first, last }
}

export default function GoogleOnboardingPage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('resolving')
  const [user, setUser] = useState<User | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0])
  const [localPhone, setLocalPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const handled = useRef(false)

  // Resolve the session that Google just established, then decide where to send the user.
  useEffect(() => {
    const init = async (u: User) => {
      if (handled.current) return
      handled.current = true
      setUser(u)

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, photo_url')
        .eq('id', u.id)
        .maybeSingle()

      // Returning, fully set-up user → straight in.
      if (profile?.phone && profile?.photo_url) {
        await syncProfileToCache()
        router.replace('/')
        return
      }
      // Has phone but no selfie → finish the compulsory photo step.
      if (profile?.phone && !profile?.photo_url) {
        await syncProfileToCache()
        router.replace('/onboarding/photo')
        return
      }

      // New Google user → collect name (prefilled) + phone.
      const g = googleName(u)
      setFirstName(profile?.first_name || g.first)
      setLastName(profile?.last_name || g.last)
      setStage('form')
    }

    let done = false
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { done = true; init(session.user) }
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!done && session?.user) { done = true; init(session.user) }
    })
    const timeout = setTimeout(() => { if (!done) setStage('error') }, 8000)

    return () => { sub.subscription.unsubscribe(); clearTimeout(timeout) }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!firstName.trim() || !lastName.trim()) { setError('Please enter your name.'); return }
    if (localPhone.trim().length < 6) { setError('Please enter a valid phone number.'); return }

    setSaving(true)
    setError('')
    const fullPhone = `${countryCode.dial}${localPhone}`
    try {
      const { error: upErr } = await supabase.from('profiles').upsert({
        id: user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: fullPhone,
      })
      if (upErr) throw upErr

      saveUser({ firstName: firstName.trim(), lastName: lastName.trim(), email: user.email ?? '', phone: fullPhone })
      router.replace('/onboarding/photo')   // compulsory selfie step
    } catch (err) {
      setSaving(false)
      setError(err instanceof Error ? err.message : 'Could not save your details. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar showAuth="login" />

      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          {stage === 'resolving' && (
            <div className="flex flex-col items-center text-center py-16">
              <svg className="animate-spin w-7 h-7 text-black mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-gray-500">Signing you in…</p>
            </div>
          )}

          {stage === 'error' && (
            <div className="text-center py-12">
              <h1 className="text-xl font-bold text-black mb-2">Sign-in didn&apos;t complete</h1>
              <p className="text-sm text-gray-500 mb-6">Something interrupted Google sign-in. Please try again.</p>
              <button onClick={() => router.replace('/signup')} className="px-6 py-3 bg-black text-white rounded-xl text-sm font-semibold">
                Back to sign up
              </button>
            </div>
          )}

          {stage === 'form' && (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">Almost there</h1>
              <p className="text-sm text-gray-500 mb-8">Confirm your name and add a phone number so hosts and riders can reach you.</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="First name" value={firstName}
                    onChange={(e) => setFirstName(e.target.value)} required autoComplete="given-name" className="input-field" />
                  <input type="text" placeholder="Last name" value={lastName}
                    onChange={(e) => setLastName(e.target.value)} required autoComplete="family-name" className="input-field" />
                </div>

                <PhoneField
                  country={countryCode}
                  localPhone={localPhone}
                  onCountryChange={(c) => { setCountryCode(c); setLocalPhone('') }}
                  onLocalChange={setLocalPhone}
                />

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button type="submit" disabled={saving}
                  className="mt-2 w-full py-3.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving…
                    </>
                  ) : 'Continue'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
