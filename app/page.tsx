'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import SiteHeader from '@/components/SiteHeader'
import HeroMap from '@/components/HeroMap'
import MobileHero from '@/components/MobileHero'
import ManifestoSection from '@/components/ManifestoSection'
import AvailabilitySection from '@/components/AvailabilitySection'
import TestimonialsSection from '@/components/TestimonialsSection'
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
      <SiteHeader />

      {/* Mobile hero:intent cards */}
      <section className="md:hidden bg-white">
        <MobileHero offerHref={offerHref} findHref={findHref} offerDisabled={suspended} />
      </section>

      {/* Desktop / tablet hero. Tablet (md–lg) is a centred stack: headline, map,
          then text. Large screens (xl) put the map in a full-height column on the right. */}
      <section className="hidden md:flex bg-white items-stretch min-h-[calc(100vh-4rem)] xl:h-[calc(100vh-4rem)] xl:overflow-hidden">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-10 px-8 py-12 text-center xl:grid xl:h-full xl:grid-cols-2 xl:grid-rows-[auto_1fr] xl:items-stretch xl:justify-start xl:gap-x-12 xl:gap-y-0 xl:text-left">
          {/* Headline */}
          <div className="xl:col-start-1 xl:row-start-1">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-black">
              Community lift-sharing
            </p>
            <h1 className="text-6xl font-bold leading-[1.02] tracking-[-0.03em] text-black xl:text-7xl">
              Get there,<br />together.
            </h1>
          </div>

          {/* Supporting text + CTAs */}
          <div className="max-w-md mx-auto xl:mx-0 xl:col-start-1 xl:row-start-2 xl:self-end">
            <p className="mb-7 text-[0.95rem] leading-relaxed text-gray-500">
              Connecting people in your community heading to the same place at the same time, so you ride together.
            </p>
            <div className="flex flex-row justify-center gap-3 xl:justify-start">
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
                  className="group inline-flex items-center gap-2 px-7 py-3.5 bg-black text-white rounded-full font-semibold text-sm shadow-[0_10px_28px_-10px_rgba(0,0,0,0.5)] hover:bg-gray-800 hover:shadow-[0_14px_32px_-10px_rgba(0,0,0,0.55)] transition-all active:scale-[0.97]"
                >
                  Offer a ride
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              )}
              <Link
                href={findHref}
                className="px-7 py-3.5 border border-gray-300 text-black rounded-full font-semibold text-sm hover:border-black hover:bg-black hover:text-white transition-all active:scale-[0.97]"
              >
                Find a ride
              </Link>
            </div>
          </div>

          {/* Map / animation: below the text on tablet; full-height right column on desktop */}
          <div className="flex w-full min-h-0 items-center justify-center xl:col-start-2 xl:row-start-1 xl:row-span-2 xl:justify-end">
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
      <TestimonialsSection />

      {/* Footer */}
      <Footer id="contact" mobileSpacer />
    </div>
  )
}
