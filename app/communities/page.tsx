'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import AppNav from '@/components/AppNav'
import Footer from '@/components/Footer'
import { getUser } from '@/lib/userStore'
import { getPublicCommunities, type PublicCommunity } from '@/lib/communities'

// ISO-2 -> flag + display name. Falls back to the raw code for anything else.
const COUNTRY_META: Record<string, { flag: string; name: string }> = {
  NG: { flag: '🇳🇬', name: 'Nigeria' },
  CA: { flag: '🇨🇦', name: 'Canada' },
  US: { flag: '🇺🇸', name: 'United States' },
  GB: { flag: '🇬🇧', name: 'United Kingdom' },
  GH: { flag: '🇬🇭', name: 'Ghana' },
  KE: { flag: '🇰🇪', name: 'Kenya' },
  ZA: { flag: '🇿🇦', name: 'South Africa' },
}

const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

interface Group { code: string; flag: string; name: string; communities: PublicCommunity[] }

export default function CommunitiesPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

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
          Veesaa grows one trusted circle at a time. Each community is a closed group that travels
          to the same places, together. Find yours below, or bring Veesaa to a new one.
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
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                      {initials(c.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-black">{c.name}</span>
                      {c.area && <span className="block truncate text-xs text-gray-500">{c.area}</span>}
                    </span>
                    <span className="ml-auto flex items-center gap-1.5 text-[11px] font-medium text-blue-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      Active
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
          <Link
            href="/#communities"
            className="shrink-0 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Bring Veesaa here
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Joining a community needs a code from its admin. Communities stay closed: no strangers, ever.
        </p>
      </div>

      <Footer />
    </div>
  )
}
