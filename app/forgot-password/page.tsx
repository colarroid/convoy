'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { FormCard, FormRow, formInput } from '@/components/FormCard'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (resetError) {
      setLoading(false)
      setError(resetError.message)
      return
    }

    setLoading(false)
    router.push(`/verify?context=reset&email=${encodeURIComponent(email)}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar showAuth="signup" />

      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">

          {/* Back */}
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to login
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">Forgot your password?</h1>
          <p className="text-sm text-gray-500 mb-8">
            Enter your email and we&apos;ll send you a secure code to reset it.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormCard>
              <FormRow label="Email">
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  className={formInput}
                />
              </FormRow>
            </FormCard>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending…
                </span>
              ) : 'Continue'}
            </button>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          </form>

          <div className="h-px bg-gray-100 my-7" />

          <p className="text-sm text-gray-700">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
