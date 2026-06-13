'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'

interface Requirement {
  label: string
  met: (pw: string) => boolean
}

const REQUIREMENTS: Requirement[] = [
  { label: 'At least 8 characters', met: (pw) => pw.length >= 8 },
  { label: 'At least 1 number', met: (pw) => /[0-9]/.test(pw) },
  { label: 'At least 1 lowercase letter and 1 uppercase letter', met: (pw) => /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
]

function ResetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get('email') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mismatch, setMismatch] = useState(false)
  const [error, setError] = useState('')

  const allMet = REQUIREMENTS.every((r) => r.met(password))
  const passwordTouched = password.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allMet) return
    if (password !== confirm) {
      setMismatch(true)
      return
    }
    setMismatch(false)
    setLoading(true)
    setError('')

    // The recovery session was created by verifyOtp on the previous screen.
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setLoading(false)
      setError(updateError.message || 'Could not reset password. The code may have expired — request a new one.')
      return
    }

    // Force a clean re-login with the new password.
    await signOut()
    setLoading(false)
    router.push('/login?reset=success')
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar showAuth="signup" />

      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-8">Set a new password</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Password field */}
            <div>
              <div className={`relative flex items-center rounded-xl border-2 bg-gray-50 transition-all
                ${passwordTouched && !allMet
                  ? 'border-red-400 bg-white'
                  : passwordTouched && allMet
                    ? 'border-green-500 bg-white'
                    : 'border-gray-200 focus-within:border-black focus-within:bg-white'
                }`}
              >
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setMismatch(false) }}
                  required
                  autoComplete="new-password"
                  autoFocus
                  className="flex-1 bg-transparent px-4 py-3.5 text-sm text-black placeholder-gray-400 focus:outline-none min-w-0"
                />
                {/* Clear */}
                {password.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPassword('')}
                    className="p-1 mr-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Clear password"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
                    </svg>
                  </button>
                )}
                {/* Show/hide */}
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
              {passwordTouched && (
                <ul className="mt-2.5 flex flex-col gap-1.5 px-1">
                  {REQUIREMENTS.map((req) => {
                    const met = req.met(password)
                    return (
                      <li key={req.label} className="flex items-center gap-2">
                        <svg
                          className={`w-3.5 h-3.5 shrink-0 transition-colors ${met ? 'text-green-500' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className={`text-xs transition-colors ${met ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                          {req.label}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Confirm password */}
            <div className={`relative flex items-center rounded-xl border-2 bg-gray-50 transition-all
              ${mismatch
                ? 'border-red-400 bg-white'
                : confirm && password === confirm
                  ? 'border-green-500 bg-white'
                  : 'border-gray-200 focus-within:border-black focus-within:bg-white'
              }`}
            >
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setMismatch(false) }}
                required
                autoComplete="new-password"
                className="flex-1 bg-transparent px-4 py-3.5 text-sm text-black placeholder-gray-400 focus:outline-none min-w-0"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="p-1 mr-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? (
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
            {mismatch && (
              <p className="text-xs text-red-500 -mt-1 px-1">Passwords don&apos;t match.</p>
            )}
            {error && (
              <p className="text-xs text-red-500 -mt-1 px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !allMet}
              className={`btn-primary mt-2 ${!allMet && !loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </span>
              ) : 'Continue'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
