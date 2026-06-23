'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import AppNav from '@/components/AppNav'
import Footer from '@/components/Footer'
import { getUser } from '@/lib/userStore'

interface Community {
  name: string
  area: string
}
interface Country {
  flag: string
  name: string
  communities: Community[]
}

// Curated directory for now. Swap to live data when communities carry a country.
const COUNTRIES: Country[] = [
  {
    flag: '🇳🇬',
    name: 'Nigeria',
    communities: [
      { name: 'Grace Chapel', area: 'Lekki, Lagos' },
      { name: 'Redeemed Family', area: 'Surulere, Lagos' },
      { name: 'TechBridge Hub', area: 'Yaba, Lagos' },
      { name: 'Unilag Staff', area: 'Akoka, Lagos' },
      { name: 'Northgate Estate', area: 'Gwarinpa, Abuja' },
      { name: 'Cornerstone Assembly', area: 'Wuse, Abuja' },
    ],
  },
  {
    flag: '🇨🇦',
    name: 'Canada',
    communities: [
      { name: 'Riverside Hall', area: 'Surrey, BC' },
      { name: 'Maple Heights', area: 'Brampton, ON' },
      { name: "St. Andrew's Parish", area: 'Mississauga, ON' },
      { name: 'Lakeshore Collective', area: 'Calgary, AB' },
    ],
  },
]

const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export default function CommunitiesPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  useEffect(() => { setLoggedIn(!!getUser()) }, [])

  const totalCommunities = COUNTRIES.reduce((n, c) => n + c.communities.length, 0)

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
          {totalCommunities} communities · {COUNTRIES.length} countries
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
        {COUNTRIES.map((country) => (
          <section key={country.name} className="mb-12 last:mb-0">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-2xl">{country.flag}</span>
              <h2 className="text-lg font-bold text-black">{country.name}</h2>
              <span className="text-sm text-gray-400">{country.communities.length}</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {country.communities.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-3.5 rounded-2xl border border-gray-200 p-4 transition-all hover:border-gray-400 hover:shadow-sm"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                    {initials(c.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-black">{c.name}</span>
                    <span className="block truncate text-xs text-gray-500">{c.area}</span>
                  </span>
                  <span className="ml-auto flex items-center gap-1.5 text-[11px] font-medium text-blue-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    Active
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}

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
