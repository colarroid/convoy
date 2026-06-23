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

      {/* Desktop hero:fits within one screen (nav + hero <= viewport) */}
      <section className="hidden md:flex bg-white h-[calc(100vh-4rem)] overflow-hidden items-stretch">
        <div className="max-w-6xl mx-auto w-full px-8 grid grid-cols-2 gap-12 items-stretch py-10">
          {/* Text: headline pinned top, supporting content pushed to the bottom */}
          <div className="flex flex-col justify-between min-h-0">
            <div>
              <p className="text-[11px] font-semibold uppercase text-black mb-3">
                Community lift-sharing
              </p>
              <h1 className="text-6xl lg:text-7xl font-semibold text-black leading-[1.02] tracking-tight">
                Get there,<br />together.
              </h1>
            </div>

            <div className="max-w-md">
              <p className="text-gray-500 text-[0.95rem] leading-relaxed mb-7">
                Connecting people in your community heading to the same place at the same time, so you ride together.
              </p>
              <div className="flex flex-row gap-3">
                {suspended ? (
                  <span
                    className="px-7 py-3.5 bg-gray-100 text-gray-400 rounded-full font-medium text-sm cursor-not-allowed"
                    title="Your account is suspended"
                  >
                    Offer a ride
                  </span>
                ) : (
                  <Link
                    href={offerHref}
                    className="group inline-flex items-center gap-2 px-7 py-3.5 bg-black text-white rounded-full font-medium text-sm hover:bg-gray-800 transition-all active:scale-[0.97]"
                  >
                    Offer a ride
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                )}
                <Link
                  href={findHref}
                  className="px-7 py-3.5 border border-black text-black rounded-full font-medium text-sm hover:bg-black hover:text-white transition-all active:scale-[0.97]"
                >
                  Find a ride
                </Link>
              </div>
            </div>
          </div>

          {/* Hero illustration:animated convergence map (sized to fit the screen) */}
          <div className="flex items-center justify-end min-h-0">
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
