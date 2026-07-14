'use client'

import Link from 'next/link'
import CommunitySwitcher from '@/components/CommunitySwitcher'

interface MobileHeroProps {
  offerHref?: string
  findHref?: string
  offerDisabled?: boolean
}

/** Mobile hero: same content as the desktop hero, without the map animation. */
export default function MobileHero({
  offerHref = '/login?next=/offer/community',
  findHref = '/login?next=/find/community',
  offerDisabled = false,
}: MobileHeroProps) {
  return (
    <div className="flex flex-col gap-6 px-5 pt-10 pb-12">
      <div>
        <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase text-black">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-600 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-600" />
          </span>
          Community lift-sharing
        </p>
        <h1 className="text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-black">
          Get there,<br />together<span className="text-blue-600">.</span>
        </h1>
        <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-gray-500">
          Connecting people in your community heading to the same place at the same time, so you ride together.
        </p>
      </div>

      {/* Returning users: held communities (renders nothing if none / logged out) */}
      <CommunitySwitcher />

      <div className="flex flex-row gap-3">
        {offerDisabled ? (
          <span
            className="px-6 py-3.5 bg-gray-100 text-gray-400 rounded-full font-semibold text-sm cursor-not-allowed"
            title="Your account is suspended"
          >
            Offer a ride
          </span>
        ) : (
          <Link
            href={offerHref}
            className="group inline-flex items-center gap-2 px-6 py-3.5 bg-black text-white rounded-full font-semibold text-sm shadow-[0_10px_28px_-10px_rgba(0,0,0,0.5)] active:scale-[0.97] transition-all"
          >
            Offer a ride
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        )}
        <Link
          href={findHref}
          className="px-6 py-3.5 border border-gray-300 text-black rounded-full font-semibold text-sm active:scale-[0.97] transition-all"
        >
          Find a ride
        </Link>
      </div>
    </div>
  )
}
