'use client'

import Link from 'next/link'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { syncProfileToCache } from '@/lib/auth'

const RESEND_SECONDS = 60
const OTP_LENGTH = 6

function VerifyForm() {
  const router = useRouter()
  const params = useSearchParams()
  const context = params.get('context') ?? 'signup' // 'signup' | 'reset'
  const email = params.get('email') ?? ''

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(RESEND_SECONDS)
  const [resending, setResending] = useState(false)
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleChange = (index: number, value: string) => {
    // Accept paste of full code
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH).split('')
      const next = Array(OTP_LENGTH).fill('')
      digits.forEach((d, i) => { next[i] = d })
      setOtp(next)
      const focusIndex = Math.min(digits.length, OTP_LENGTH - 1)
      inputs.current[focusIndex]?.focus()
      return
    }

    const digit = value.replace(/\D/g, '')
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    setError('')

    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < OTP_LENGTH) {
      setError(`Please enter all ${OTP_LENGTH} digits.`)
      return
    }
    setLoading(true)
    setError('')

    const { error: vErr } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: context === 'reset' ? 'recovery' : 'signup',
    })

    if (vErr) {
      setLoading(false)
      setError(vErr.message || 'That code is invalid or has expired.')
      return
    }

    if (context === 'reset') {
      // Recovery session is now active → let them set a new password
      router.push(`/reset-password?email=${encodeURIComponent(email)}`)
    } else {
      await syncProfileToCache()
      router.push('/onboarding/photo')
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError('')
    if (context === 'reset') {
      await supabase.auth.resetPasswordForEmail(email)
    } else {
      await supabase.auth.resend({ type: 'signup', email })
    }
    setResending(false)
    setOtp(Array(OTP_LENGTH).fill(''))
    setCountdown(RESEND_SECONDS)
    inputs.current[0]?.focus()
  }

  const isComplete = otp.every((d) => d !== '')

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar showAuth="signup" />

      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">

          {/* Back */}
          <Link
            href={context === 'reset' ? '/forgot-password' : '/signup'}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">
            Verification code sent!
          </h1>
          <p className="text-sm text-gray-500 mb-1">
            We&apos;ve sent a secure login code to
          </p>
          {email && (
            <p className="text-sm font-medium text-black underline mb-6 break-all">{email}</p>
          )}
          {!email && <div className="mb-6" />}

          <p className="text-sm font-semibold text-black mb-4">Please enter it below</p>

          <form onSubmit={handleSubmit}>
            {/* OTP boxes */}
            <div className="flex gap-2 mb-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={OTP_LENGTH}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onFocus={(e) => e.target.select()}
                  className={`w-full aspect-square text-center text-xl font-semibold rounded-xl border-2 bg-gray-50
                    focus:outline-none focus:bg-white transition-all
                    ${error
                      ? 'border-red-400 focus:border-red-400'
                      : digit
                        ? 'border-black bg-white'
                        : 'border-gray-200 focus:border-black'
                    }`}
                  autoFocus={i === 0}
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                />
              ))}
            </div>

            {error && (
              <p className="text-xs text-red-500 mb-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !isComplete}
              className={`btn-primary mt-4 ${!isComplete && !loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying…
                </span>
              ) : 'Continue'}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-sm text-gray-700">Didn&apos;t receive it?</p>
            {countdown > 0 ? (
              <p className="text-sm text-gray-400 mt-0.5">
                Resend in <span className="tabular-nums">{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-sm text-blue-600 hover:underline font-medium mt-0.5 disabled:opacity-50"
              >
                {resending ? 'Resending…' : 'Resend it'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  )
}
