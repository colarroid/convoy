'use client'

import { useState } from 'react'
import { requestCall } from '@/lib/calls'

/** A button that opens a "schedule a call" modal and stores the request. */
export default function ScheduleCallButton({
  label = 'Schedule a call',
  className = 'rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800',
}: {
  label?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [community, setCommunity] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      await requestCall({ name, email, community, isAdmin })
      setSent(true)
    } catch {
      setError('Something went wrong. Check your email and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>{label}</button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 text-left text-black shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="float-right -mr-1 -mt-1 text-gray-400 hover:text-black"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {sent ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                </div>
                <h2 className="text-lg font-bold">Request received</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">Thanks! We&apos;ll reach out to {email} to set up a time.</p>
                <button onClick={() => setOpen(false)} className="mt-6 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">Done</button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold">Schedule a call</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                  Tell us a little about your community and we&apos;ll get in touch to find a time.
                </p>
                <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none" />
                  <input value={community} onChange={(e) => setCommunity(e.target.value)} placeholder="Community or city" className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none" />
                  <label className="mt-1 flex items-start gap-2.5 text-sm text-gray-600">
                    <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                    <span>I&apos;m an admin or I own / lead this community</span>
                  </label>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <button type="submit" disabled={busy} className="mt-1 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60">
                    {busy ? 'Sending…' : 'Request a call'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
