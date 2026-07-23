'use client'

import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import Footer from '@/components/Footer'
import { howToGraph } from '@/lib/jsonLd'

/**
 * How Veesaa works: a bold header, a numbered step-by-step timeline (visual on
 * one side, copy on the other, joined by a connecting line), and supporting
 * sections that explain community codes, trust, and the two ways to ride.
 */
export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Step-by-step schema so engines and AI assistants can describe the flow. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToGraph(STEPS.map((s) => ({ name: s.title, text: s.body })))),
        }}
      />
      <SiteHeader />

      {/* ── Header ── */}
      <section className="bg-black px-5 py-24 text-white md:px-8 md:py-32">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.28em] text-blue-400">How it works</p>
          <h1 className="max-w-4xl text-5xl font-bold leading-[1.03] tracking-[-0.03em] md:text-7xl">
            How Veesaa works
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/60">
            Veesaa connects people from the same community who are heading to the same place at the same time, so they ride together. Here is the whole journey, start to finish.
          </p>
        </div>
      </section>

      {/* ── Numbered timeline ── */}
      <section className="bg-white px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-5xl">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative grid gap-6 pb-16 last:pb-0 md:grid-cols-2 md:gap-14">
              {/* connecting line + node (desktop) */}
              {i < STEPS.length - 1 && (
                <span aria-hidden className="absolute left-1/2 top-2 hidden h-full w-px -translate-x-1/2 bg-gray-200 md:block" />
              )}

              {/* visual tile */}
              <div className={`order-1 ${i % 2 === 1 ? 'md:order-2' : ''}`}>
                <div className={`flex aspect-[16/11] items-center justify-center rounded-3xl bg-gradient-to-br ${s.gradient} ring-1 ring-black/5`}>
                  <span className="text-white">{s.icon}</span>
                </div>
              </div>

              {/* copy */}
              <div className={`order-2 flex flex-col justify-center ${i % 2 === 1 ? 'md:order-1' : ''}`}>
                <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                  {s.n}
                </span>
                <h2 className="mb-2.5 text-2xl font-bold tracking-tight text-black md:text-3xl">{s.title}</h2>
                <p className="max-w-md text-[15px] leading-relaxed text-gray-500">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Two ways to ride (Bolt-style intro block) ── */}
      <section className="bg-[#f5f4f1] px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.025em] text-gray-600">Two ways to ride</p>
          <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-black md:text-5xl">
            Offer a seat, or find one.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-white p-8 ring-1 ring-black/5">
              <h3 className="mb-2 text-xl font-bold text-black">Host a ride</h3>
              <p className="mb-6 text-[15px] leading-relaxed text-gray-500">
                Heading somewhere with room to spare? Post your departure time and route, then approve neighbours from your community who want to come along. It is free, and we take no cut.
              </p>
              <Link href="/offer/community" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                Offer a ride &rarr;
              </Link>
            </div>
            <div className="rounded-3xl bg-white p-8 ring-1 ring-black/5">
              <h3 className="mb-2 text-xl font-bold text-black">Find a ride</h3>
              <p className="mb-6 text-[15px] leading-relaxed text-gray-500">
                Need a lift? See who from your community is already heading your way, request a seat, and travel together. No strangers, just neighbours.
              </p>
              <Link href="/find/community" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                Find a ride &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── What makes it work ── */}
      <section className="bg-white px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.025em] text-gray-600">What makes it work</p>
          <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-black md:text-5xl">
            Built on codes and trust.
          </h2>
          <div className="mt-14 grid gap-x-12 gap-y-12 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-blue-600 ring-1 ring-black/5">
                  {f.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-black">{f.title}</h3>
                <p className="text-[15px] leading-relaxed text-gray-500">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-black px-5 py-24 text-white md:px-8 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">Get there, together.</h2>
          <p className="mx-auto mt-5 max-w-md leading-relaxed text-white/60">
            Enter your community code and take your first shared ride today.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-gray-100 active:scale-[0.97]"
            >
              Get started
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 active:scale-[0.97]"
            >
              About Veesaa
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

const STEPS: { n: number; title: string; body: string; gradient: string; icon: React.ReactNode }[] = [
  {
    n: 1,
    title: 'Enter your community code',
    body: 'Your code is your destination. It gives you access to a community and lets you offer or join a ride to that destination, so you never type a destination address. Enter your community code and we know where you are going.',
    gradient: 'from-blue-500 to-blue-700',
    icon: (
      <svg className="h-14 w-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M8 3H7a4 4 0 00-4 4v1M16 3h1a4 4 0 014 4v1M8 21H7a4 4 0 01-4-4v-1M16 21h1a4 4 0 004-4v-1" />
        <path d="M9 9l-1.5 6M15 9l-1.5 6M8 12h8" />
      </svg>
    ),
  },
  {
    n: 2,
    title: 'Offer a ride or find one',
    body: 'Post your departure as a host with a pickup point and time, or browse neighbours who are already heading your way and request a seat. Either path takes under a minute.',
    gradient: 'from-neutral-800 to-black',
    icon: (
      <svg className="h-14 w-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 8.00004L19 10M19 10L17.5 6.30004C17.3585 5.92138 17.1057 5.59446 16.7747 5.36239C16.4437 5.13032 16.0502 5.00399 15.646 5.00004H8.4C7.9925 4.99068 7.59188 5.10605 7.25177 5.3307C6.91166 5.55536 6.64832 5.87856 6.497 6.25704L5 10M19 10H5M19 10C20.1046 10 21 10.8954 21 12V16C21 17.1046 20.1046 18 19 18M5 10L3 8.00004M5 10C3.89543 10 3 10.8954 3 12V16C3 17.1046 3.89543 18 5 18M7 14H7.01M17 14H17.01M19 18H5M19 18V20M5 18V20" />
      </svg>
    ),
  },
  {
    n: 3,
    title: 'Match with your neighbours',
    body: 'Hosts see who is seeking a ride and approve them. Everyone on the trip belongs to the same community as you, so you always know who you are travelling with.',
    gradient: 'from-blue-500 to-blue-700',
    icon: (
      <svg className="h-14 w-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    n: 4,
    title: 'Ride together',
    body: 'Meet at the agreed pickup point and go together to the destination. For free, no strangers, and every shared kilometre counts, bringing the community closer.',
    gradient: 'from-neutral-800 to-black',
    icon: (
      <svg className="h-14 w-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 01-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 1116 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
]

const FEATURES: { title: string; body: string; icon: React.ReactNode }[] = [
  {
    title: 'Community codes',
    body: 'Your code does two things: it gives you access to a closed community, and it tells us the destination its trips are heading to. Hold more than one code to belong to more than one community.',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 9l-1.5 6M15 9l-1.5 6M8 12h8" />
        <rect x="3" y="3" width="18" height="18" rx="4" />
      </svg>
    ),
  },
  {
    title: 'Real profiles',
    body: 'Everyone rides as themselves, with a photo and a record of completed trips, so trust is built in before you ever meet.',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    title: 'Clear pickup details',
    body: 'Times and pickup points are agreed up front, and cancellations notify everyone involved, so no one is left waiting or guessing.',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
]
