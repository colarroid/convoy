'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import AppNav from '@/components/AppNav'
import Footer from '@/components/Footer'
import { getUser } from '@/lib/userStore'
import { getPublicCommunities, type PublicCommunity } from '@/lib/communities'
import { requestCall } from '@/lib/calls'
import CommunityLogo from '@/components/CommunityLogo'
import { COUNTRY_CODES } from '@/lib/countries'

// ISO-2 -> flag + display name, derived from the live-countries list so it stays
// in sync. Falls back to the raw code for anything else.
const COUNTRY_META: Record<string, { flag: string; name: string }> = Object.fromEntries(
  COUNTRY_CODES.map(c => [c.code, { flag: c.flag, name: c.name }]),
)

interface Group { code: string; flag: string; name: string; communities: PublicCommunity[] }

export default function CommunitiesPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  // "Schedule a call" modal
  const [callOpen, setCallOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [community, setCommunity] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [callError, setCallError] = useState('')

  const submitCall = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || busy) return
    setBusy(true)
    setCallError('')
    try {
      await requestCall({ name, email, community, isAdmin })
      setSent(true)
    } catch {
      setCallError('Something went wrong. Check your email and try again.')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    setLoggedIn(!!getUser())
    getPublicCommunities()
      .then((list) => {
        const byCode = new Map<string, PublicCommunity[]>()
        for (const c of list) {
          const code = (c.country || '').toUpperCase()
          if (!byCode.has(code)) byCode.set(code, [])
          byCode.get(code)!.push(c)
        }
        const out: Group[] = Array.from(byCode.entries()).map(([code, communities]) => ({
          code,
          flag: COUNTRY_META[code]?.flag ?? '🏳️',
          name: COUNTRY_META[code]?.name ?? code,
          communities,
        }))
        out.sort((a, b) => a.name.localeCompare(b.name))
        setGroups(out)
      })
      .finally(() => setLoading(false))
  }, [])

  const total = groups.reduce((n, g) => n + g.communities.length, 0)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {loggedIn ? <AppNav /> : <Navbar showAuth="login" />}

      {/* Sub-header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-3">
          <span className="text-sm font-semibold text-black">Communities</span>
        </div>
      </div>

      {/* Mini hero */}
      <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white px-5 py-14 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          {total} {total === 1 ? 'community' : 'communities'} · {groups.length} {groups.length === 1 ? 'country' : 'countries'}
        </span>
        <h1 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight text-black md:text-4xl">
          Communities on Veesaa
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500">
          Veesaa grows one trusted circle at a time. Find yours below, or bring Veesaa to a new one.
        </p>
      </div>

      {/* Country sections */}
      <div className="mx-auto w-full max-w-5xl px-5 py-12 md:px-8">
        {loading ? (
          <p className="py-12 text-center text-sm text-gray-400">Loading communities…</p>
        ) : groups.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">No communities to show yet.</p>
        ) : (
          groups.map((g) => (
            <section key={g.code} className="mb-12 last:mb-0">
              <div className="mb-5 flex items-center gap-3">
                <span className="text-2xl">{g.flag}</span>
                <h2 className="text-lg font-bold text-black">{g.name}</h2>
                <span className="text-sm text-gray-400">{g.communities.length}</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {g.communities.map((c, i) => (
                  <div
                    key={`${c.name}-${i}`}
                    className="flex items-center gap-3.5 rounded-2xl border border-gray-200 p-4 transition-all hover:border-gray-400 hover:shadow-sm"
                  >
                    <CommunityLogo src={c.logo_url} name={c.name} className="h-11 w-11 text-sm" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-black">{c.name}</span>
                      {c.area && <span className="block truncate text-xs text-gray-500">{c.area}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}

        {/* CTA */}
        <div className="mt-4 flex flex-col items-start justify-between gap-4 rounded-2xl bg-gray-50 px-6 py-6 sm:flex-row sm:items-center">
          <div>
            <p className="mb-0.5 text-sm font-bold text-black">Don&apos;t see your community?</p>
            <p className="text-sm leading-relaxed text-gray-500">
              Tell us where you are and we&apos;ll reach out when Veesaa lands in your community.
            </p>
          </div>
          <button
            onClick={() => setCallOpen(true)}
            className="shrink-0 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Schedule a call
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Joining a community needs a code from its admin. Communities stay closed: no strangers, ever.
        </p>
      </div>

      {/* Schedule a call modal */}
      {callOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setCallOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setCallOpen(false)}
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
                <h2 className="text-lg font-bold text-black">Request received</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Thanks! We&apos;ll reach out to {email} to set up a time.
                </p>
                <button onClick={() => setCallOpen(false)} className="mt-6 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">Done</button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-black">Schedule a call</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                  Tell us a little about your community and we&apos;ll get in touch to find a time.
                </p>
                <form onSubmit={submitCall} className="mt-5 flex flex-col gap-3">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none" />
                  <input value={community} onChange={(e) => setCommunity(e.target.value)} placeholder="Community or city" className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none" />

                  <label className="mt-1 flex items-start gap-2.5 text-sm text-gray-600">
                    <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                    <span>I&apos;m an admin or I own / lead this community</span>
                  </label>

                  {callError && <p className="text-sm text-red-500">{callError}</p>}

                  <button type="submit" disabled={busy} className="mt-1 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60">
                    {busy ? 'Sending…' : 'Request a call'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
