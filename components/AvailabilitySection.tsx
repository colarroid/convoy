'use client'

import Link from 'next/link'
import ScheduleCallButton from '@/components/ScheduleCallButton'

function LiveRow({ flag, name }: { flag: string; name: string }) {
  return (
    <div className="flex items-center justify-between py-4">
      <span className="flex items-center gap-3">
        <span className="text-xl">{flag}</span>
        <span className="font-semibold text-white">{name}</span>
      </span>
      <span className="flex items-center gap-2 text-sm font-medium text-blue-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
        </span>
        Live
      </span>
    </div>
  )
}

/** "Where Veesaa is live" + a schedule-a-call CTA to bring it somewhere new. */
export default function AvailabilitySection() {
  return (
    <section className="relative bg-neutral-950 text-white py-24 md:py-32 px-5 md:px-8 overflow-hidden">
      <div className="pointer-events-none absolute -top-24 right-[-10%] w-[42rem] h-[42rem] rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="relative max-w-5xl mx-auto grid md:grid-cols-2 gap-14 md:gap-20 items-center">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Where Veesaa is live
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">We grow one community at a time. Trust first, reach second.</p>

          <div className="border-t border-b border-white/10 divide-y divide-white/10 mb-9">
            <LiveRow flag="🇳🇬" name="Nigeria" />
            <LiveRow flag="🇨🇦" name="Canada" />
          </div>

          <p className="text-sm font-semibold text-white mb-1">Bring Veesaa to your community</p>
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">Not live near you yet? Book a quick call and we&apos;ll help bring Veesaa to your community.</p>

          <div className="flex flex-wrap items-center gap-3">
            <ScheduleCallButton className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-100" />
            <Link
              href="/communities"
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              View communities
            </Link>
          </div>
        </div>

        {/* Right column intentionally left empty; illustration to come */}
        <div aria-hidden />
      </div>
    </section>
  )
}
