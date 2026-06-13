'use client'

import Link from 'next/link'
import Image from 'next/image'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Good morning.', emoji: '☀️' }
  if (hour < 17) return { text: 'Good afternoon.', emoji: '🌤️' }
  return { text: 'Good evening.', emoji: '🌙' }
}


interface MobileHeroProps {
  offerHref?: string
  findHref?: string
}

export default function MobileHero({
  offerHref = '/login?next=/offer/community',
  findHref = '/login?next=/find/community',
}: MobileHeroProps) {
  const greeting = getGreeting()

  return (
    <div className="px-4 pt-6 pb-8 flex flex-col gap-5">
      {/* Greeting + headline */}
      <div className="px-1">
        <p className="text-sm text-gray-400 mb-1.5 flex items-center gap-1.5">
          {greeting.text}
          <span>{greeting.emoji}</span>
        </p>
        <h1 className="text-3xl font-bold text-black leading-tight tracking-tight">
          Get there, together.
        </h1>
      </div>

      {/* Intent cards */}
      <div className="flex flex-col gap-4">
        {/* Offer a ride */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="relative w-full aspect-[2/1] bg-gray-100">
            <Image
              src="/assets/offer-ride.png"
              alt="A driver heading out"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="p-5">
            <h2 className="text-xl font-bold text-black mb-1.5">Offer a ride</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Share your departure time and bring others from church along your route.
            </p>
            <Link
              href={offerHref}
              className="inline-flex items-center px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 active:scale-[0.97] transition-all"
            >
              Get started
            </Link>
          </div>
        </div>

        {/* Find a ride */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="relative w-full aspect-[2/1] bg-gray-100">
            <Image
              src="/assets/find-ride.png"
              alt="A rider getting in"
              fill
              className="object-cover"
            />
          </div>
          <div className="p-5">
            <h2 className="text-xl font-bold text-black mb-1.5">Find a ride</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Join someone from your community already heading your way.
            </p>
            <Link
              href={findHref}
              className="inline-flex items-center px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 active:scale-[0.97] transition-all"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-gray-400 text-center px-4">
        Rides are free. This is community lift-sharing.
      </p>
    </div>
  )
}
