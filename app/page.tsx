'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import HeroMap from '@/components/HeroMap'
import AppNav from '@/components/AppNav'
import MobileHero from '@/components/MobileHero'
import ManifestoSection from '@/components/ManifestoSection'
import AvailabilitySection from '@/components/AvailabilitySection'
import StatCardSection from '@/components/StatCardSection'
import Footer from '@/components/Footer'
import { getUser } from '@/lib/userStore'
import { useSuspended } from '@/lib/useSuspended'
import { getKmShared } from '@/lib/trips'

// Show a 15K floor until real km overtake it, then switch to the live figure.
const KM_FLOOR = 15_000

/** Format a whole number into a compact value + suffix, e.g. 15000 -> {value:'15', suffix:'K'}. */
function formatCompact(n: number): { value: string; suffix: string } {
  const compact = (d: number) => {
    const v = n / d
    return Number.isInteger(v) ? String(v) : v.toFixed(1)
  }
  if (n >= 1_000_000) return { value: compact(1_000_000), suffix: 'M' }
  if (n >= 1_000) return { value: compact(1_000), suffix: 'K' }
  return { value: String(n), suffix: '' }
}

export default function LandingPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [km, setKm] = useState(0)
  const { suspended } = useSuspended()

  useEffect(() => {
    setLoggedIn(!!getUser())
    getKmShared().then(setKm).catch(() => {})
  }, [])

  const kmStat = formatCompact(Math.max(KM_FLOOR, km))

  // When signed in, the buttons skip the login gate
  const offerHref = loggedIn ? '/offer/community' : '/login?next=/offer/community'
  const findHref = loggedIn ? '/find/community' : '/login?next=/find/community'

  return (
    <div className="min-h-screen flex flex-col">
      {loggedIn ? <AppNav /> : <Navbar showAuth="both" />}

      {/* Mobile hero:intent cards */}
      <section className="md:hidden bg-white">
        <MobileHero offerHref={offerHref} findHref={findHref} offerDisabled={suspended} />
      </section>

      {/* Desktop hero:fills the first viewport */}
      <section className="hidden md:flex bg-white min-h-[calc(100vh-4rem)] items-center">
        <div className="max-w-6xl mx-auto w-full px-8 flex items-center gap-12">
          {/* Text */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 mb-6 border border-gray-200 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              Community lift-sharing · free to ride
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-black leading-tight tracking-tight mb-6">
              Get there,<br />together.
            </h1>
            <p className="text-gray-500 text-[0.95rem] leading-relaxed mb-8 max-w-md">
              Veesaa connects people in your community heading to the same place at the same time, so you ride together. The destination is the point, not the fare.
            </p>
            <div className="flex flex-row gap-3">
              {suspended ? (
                <span
                  className="px-6 py-3 bg-gray-100 text-gray-400 rounded-full font-medium text-sm cursor-not-allowed"
                  title="Your account is suspended"
                >
                  Offer a ride
                </span>
              ) : (
                <Link
                  href={offerHref}
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-medium text-sm hover:bg-gray-800 transition-all active:scale-[0.97]"
                >
                  Offer a ride
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              )}
              <Link
                href={findHref}
                className="px-6 py-3 border border-black text-black rounded-full font-medium text-sm hover:bg-black hover:text-white transition-all active:scale-[0.97]"
              >
                Find a ride
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Free to ride
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 4.97-3.6 8.6-8.25 9.75a.75.75 0 01-.34 0C7.6 20.6 4 16.97 4 12V6.3a.75.75 0 01.48-.7l7.5-2.8a.75.75 0 01.54 0l7.5 2.8a.75.75 0 01.48.7V12z" />
                </svg>
                Verified members
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3m-1.5 0h12a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5H6a1.5 1.5 0 01-1.5-1.5v-6A1.5 1.5 0 016 10.5z" />
                </svg>
                No strangers, ever
              </span>
            </div>
          </div>

          {/* Hero illustration:animated convergence map */}
          <div className="flex-1 flex items-center justify-end">
            <HeroMap />
          </div>
        </div>
      </section>

      {/* Marketing sections */}
      <ManifestoSection />
      <StatCardSection
        statPrefix=""
        statValue={kmStat.value}
        statSuffix={kmStat.suffix}
        statCaption="Kilometres shared on Veesaa"
      />
      <AvailabilitySection />

      {/* Footer */}
      <Footer id="contact" mobileSpacer />
    </div>
  )
}
