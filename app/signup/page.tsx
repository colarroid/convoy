'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import PhoneField from '@/components/PhoneField'
import DateOfBirthField from '@/components/DateOfBirthField'
import { COUNTRY_CODES } from '@/lib/countries'
import { isAdult } from '@/lib/age'
import { saveUser } from '@/lib/userStore'
import { supabase } from '@/lib/supabase'
import { signInWithGoogle } from '@/lib/auth'

const PASSWORD_REQS = [
  { label: 'At least 8 characters', met: (pw: string) => pw.length >= 8 },
  { label: 'At least 1 number', met: (pw: string) => /[0-9]/.test(pw) },
  { label: 'At least 1 lowercase letter and 1 uppercase letter', met: (pw: string) => /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
]

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailExists, setEmailExists] = useState(false)
  const [localPhone, setLocalPhone] = useState('')
  const [dob, setDob] = useState('')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const fullPhone = `${countryCode.dial}${localPhone}`

  const handleGoogle = async () => {
    setError('')
    try {
      await signInWithGoogle()   // redirects to Google, then back to /onboarding/google
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start Google sign-in.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dob) { setError('Please enter your date of birth.'); return }
    if (!isAdult(dob)) { setError('You must be 18 or older to use Veesaa.'); return }
    setLoading(true)
    setError('')
    setEmailExists(false)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        // The email-confirmation link lands straight on the compulsory selfie step.
        emailRedirectTo: `${window.location.origin}/onboarding/photo`,
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          phone: fullPhone,
          date_of_birth: dob,
        },
      },
    })

    if (signUpError) {
      setLoading(false)
      setError(signUpError.message)
      return
    }

    // Supabase hides "email already registered" to prevent enumeration — it
    // returns a user with no identities instead of an error. Detect and guide.
    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      setLoading(false)
      setEmailExists(true)
      setError('An account with this email already exists.')
      return
    }

    // Cache for the display layer; profile row is created by the DB trigger.
    saveUser({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: fullPhone })
    setLoading(false)

    if (data.session) {
      // Email confirmation is OFF → already signed in, go straight to the selfie step.
      router.push('/onboarding/photo')
    } else {
      // Email confirmation is ON → verify via emailed code/link.
      router.push(`/verify?context=signup&email=${encodeURIComponent(form.email)}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar showAuth="login" />

      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">
            Create your free account
          </h1>
          <p className="text-sm text-gray-500 mb-8">Rides are free. No fares, ever.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First name"
                value={form.firstName}
                onChange={update('firstName')}
                required
                autoComplete="given-name"
                className="input-field"
              />
              <input
                type="text"
                placeholder="Last name"
                value={form.lastName}
                onChange={update('lastName')}
                required
                autoComplete="family-name"
                className="input-field"
              />
            </div>

            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={update('email')}
              required
              autoComplete="email"
              className="input-field"
            />

            {/* Phone with inline country code prefix */}
            <PhoneField
              country={countryCode}
              localPhone={localPhone}
              onCountryChange={(c) => { setCountryCode(c); setLocalPhone('') }}
              onLocalChange={setLocalPhone}
            />

            <div>
              <label className="block text-xs text-gray-500 mb-1.5 px-1">Date of birth — you must be 18 or older</label>
              <DateOfBirthField value={dob} onChange={setDob} />
            </div>

            <div>
              <div className={`relative flex items-center rounded-xl border-2 bg-gray-50 transition-all
                ${form.password.length > 0 && !PASSWORD_REQS.every(r => r.met(form.password))
                  ? 'border-red-400 bg-white'
                  : form.password.length > 0 && PASSWORD_REQS.every(r => r.met(form.password))
                    ? 'border-green-500 bg-white'
                    : 'border-gray-200 focus-within:border-black focus-within:bg-white'
                }`}
              >
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={update('password')}
                  required
                  autoComplete="new-password"
                  className="flex-1 bg-transparent px-4 py-3.5 text-sm text-black placeholder-gray-400 focus:outline-none min-w-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 mr-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Requirements checklist */}
              {form.password.length > 0 && (
                <ul className="mt-2.5 flex flex-col gap-1.5 px-1">
                  {PASSWORD_REQS.map((req) => {
                    const met = req.met(form.password)
                    return (
                      <li key={req.label} className="flex items-center gap-2">
                        <svg className={`w-3.5 h-3.5 shrink-0 transition-colors ${met ? 'text-green-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className={`text-xs transition-colors ${met ? 'text-green-600 font-medium' : 'text-gray-400'}`}>{req.label}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary mt-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Continue'}
            </button>

            {error && (
              <p className="text-sm text-red-500 text-center">
                {error}
                {emailExists && (
                  <>
                    {' '}
                    <Link href="/login" className="font-semibold underline hover:text-red-600">Log in instead</Link>
                  </>
                )}
              </p>
            )}
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button type="button" onClick={handleGoogle} className="btn-secondary">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-xs text-gray-400 leading-relaxed">
            By proceeding, you agree to our{' '}
            <Link href="/terms-of-use" className="text-gray-600 hover:text-black underline">Terms of Use</Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-gray-600 hover:text-black underline">Privacy Policy</Link>.
          </p>

          <p className="mt-6 text-sm text-gray-700">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
