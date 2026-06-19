'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import AppNav from '@/components/AppNav'
import MobileHero from '@/components/MobileHero'
import ManifestoSection from '@/components/ManifestoSection'
import AvailabilitySection from '@/components/AvailabilitySection'
import StatCardSection from '@/components/StatCardSection'
import Footer from '@/components/Footer'
import { getUser } from '@/lib/userStore'
import { useSuspended } from '@/lib/useSuspended'
import { getMilesShared } from '@/lib/trips'

/** Format whole miles into a compact value + suffix, e.g. 12384 -> {value:'12.4', suffix:'K'}. */
function formatMiles(miles: number): { value: string; suffix: string } {
  if (miles >= 1_000_000) return { value: (miles / 1_000_000).toFixed(1), suffix: 'M' }
  if (miles >= 1_000) return { value: (miles / 1_000).toFixed(1), suffix: 'K' }
  return { value: String(miles), suffix: '' }
}

export default function LandingPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [miles, setMiles] = useState(0)
  const { suspended } = useSuspended()

  useEffect(() => {
    setLoggedIn(!!getUser())
    getMilesShared().then(setMiles).catch(() => {})
  }, [])

  const milesStat = formatMiles(miles)

  // When signed in, the buttons skip the login gate
  const offerHref = loggedIn ? '/offer/community' : '/login?next=/offer/community'
  const findHref = loggedIn ? '/find/community' : '/login?next=/find/community'

  return (
    <div className={`min-h-screen flex flex-col ${loggedIn ? 'md:h-screen md:overflow-hidden' : ''}`}>
      {loggedIn ? <AppNav /> : <Navbar showAuth="both" />}

      {/* Mobile hero:intent cards */}
      <section className={`md:hidden bg-white ${loggedIn ? 'flex-1' : ''}`}>
        <MobileHero offerHref={offerHref} findHref={findHref} offerDisabled={suspended} />
      </section>

      {/* Desktop hero:fills the first viewport (logged in: single screen, no scroll) */}
      <section className={`hidden md:flex bg-white ${loggedIn ? 'flex-1 min-h-0' : 'min-h-[calc(100vh-4rem)] items-center'}`}>
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
                  className="px-6 py-3 bg-black text-white rounded-full font-medium text-sm hover:bg-gray-800 transition-all active:scale-[0.97]"
                >
                  Offer a ride
                </Link>
              )}
              <Link
                href={findHref}
                className="px-6 py-3 border border-black text-black rounded-full font-medium text-sm hover:bg-black hover:text-white transition-all active:scale-[0.97]"
              >
                Find a ride
              </Link>
            </div>
            <p className="mt-5 text-xs text-gray-400 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.657-1.343-3-3-3S6 9.343 6 11s1.343 3 3 3 3-1.343 3-3zm0 0c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3zm-9 8a9 9 0 1118 0H3z" />
              </svg>
              Closed to your community. No strangers, ever.
            </p>
          </div>

          {/* Hero image:contained square on the right */}
          <div className="flex-1 h-full flex items-center justify-end">
            <div className="relative h-[78%] max-h-[560px] aspect-square rounded-2xl overflow-hidden">
              <Image
                src="/assets/woman-daughter.png"
                alt="A mother and daughter ready for a ride"
                fill
                className="object-cover"
                priority
                sizes="(min-width: 1024px) 36rem, 45vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Marketing sections:logged-out visitors only */}
      {!loggedIn && (
        <>
          <ManifestoSection />
          <StatCardSection
            statPrefix=""
            statValue={milesStat.value}
            statSuffix={milesStat.suffix}
            statCaption="Miles shared on Veesaa"
          />
          <AvailabilitySection />
        </>
      )}

      {/* Footer */}
      <Footer id="contact" mobileSpacer />
    </div>
  )
}
