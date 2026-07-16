'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

/**
 * About Veesaa: why we are building this, a mission statement, and the belief
 * that communities are stronger when the people in them move together.
 * The hero uses a scroll-driven parallax so the headline drifts and settles.
 */
export default function AboutPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => { raf = 0; setScrollY(window.scrollY) }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])

  // Parallax: headline rises slowly, eyebrow/subtext fade as you scroll past the hero.
  const heroFade = Math.max(0, 1 - scrollY / 420)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar showAuth="both" />

      {/* ── Bold parallax hero ── */}
      <section className="relative overflow-hidden bg-black text-white">
        {/* drifting glow layers (parallax) */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-24 h-[36rem] w-[36rem] rounded-full bg-blue-500/20 blur-[130px]"
          style={{ transform: `translateY(${scrollY * 0.25}px)` }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/3 -left-32 h-[28rem] w-[28rem] rounded-full bg-blue-400/10 blur-[120px]"
          style={{ transform: `translateY(${scrollY * -0.15}px)` }}
        />

        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-5 py-28 md:px-8">
          <div style={{ transform: `translateY(${scrollY * -0.12}px)`, opacity: heroFade }}>
            <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.28em] text-blue-400">Our mission</p>
            <h1 className="max-w-4xl text-5xl font-bold leading-[1.03] tracking-[-0.03em] md:text-7xl lg:text-[5.5rem]">
              Bring communities closer, one shared ride at a time.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/60">
              We are building the simplest way for people who already trust each other to travel together to the places they share.
            </p>
          </div>
        </div>

        {/* scroll hint */}
        <div
          className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 transition-opacity duration-500"
          style={{ opacity: heroFade }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">Scroll</span>
          <svg className="h-4 w-4 animate-bounce text-white/40" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Mission statement ── */}
      <section className="bg-white px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-4xl">
          <p className="mb-8 text-xs font-bold uppercase tracking-[0.025em] text-gray-600">The belief behind Veesaa</p>
          <p className="text-[26px] font-bold leading-[1.35] tracking-tight text-black md:text-[38px] md:leading-[1.3]">
            Every day, people living side by side head to the same place and travel there alone. We think that is a missed connection. Veesaa turns those separate journeys into shared ones, so getting there also means getting closer.
          </p>
        </div>
      </section>

      {/* ── Why we are building this ── */}
      <section className="bg-[#f5f4f1] px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.025em] text-gray-600">Why we are building this</p>
            <h2 className="text-3xl font-bold tracking-tight text-black md:text-5xl">
              Communities are stronger when they move together.
            </h2>
          </div>

          <div className="mt-14 grid gap-x-12 gap-y-12 md:grid-cols-3">
            {REASONS.map((r) => (
              <div key={r.title}>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 ring-1 ring-black/5">
                  {r.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-black">{r.title}</h3>
                <p className="text-[15px] leading-relaxed text-gray-500">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What we stand for ── */}
      <section className="bg-white px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.025em] text-gray-600">What we stand for</p>
          <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-black md:text-5xl">
            Trust first, reach second.
          </h2>

          <div className="mt-14 grid gap-y-10 md:grid-cols-2 md:gap-x-16">
            {VALUES.map((v) => (
              <div key={v.title} className="border-t border-gray-200 pt-6">
                <h3 className="mb-2 text-xl font-bold text-black">{v.title}</h3>
                <p className="text-[15px] leading-relaxed text-gray-500">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-black px-5 py-24 text-white md:px-8 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">Ready to get there, together?</h2>
          <p className="mx-auto mt-5 max-w-md text-white/60 leading-relaxed">
            Join your community on Veesaa and turn everyday journeys into shared ones.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-gray-100 active:scale-[0.97]"
            >
              Get started
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 active:scale-[0.97]"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

const REASONS: { title: string; body: string; icon: React.ReactNode }[] = [
  {
    title: 'People over strangers',
    body: 'Rides happen inside communities you already belong to, so the person beside you is a neighbour, not a stranger.',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    title: 'Shared destinations',
    body: 'Your community code is how we recognise where you are heading, and at the same time it shows you have access to that community. No addresses to compare, no guesswork.',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 01-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 1116 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: 'Fewer cars, more room',
    body: 'When neighbours ride together, the same trip takes fewer cars. Lighter roads, less spent, and a smaller footprint for everyone.',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 8.00004L19 10M19 10L17.5 6.30004C17.3585 5.92138 17.1057 5.59446 16.7747 5.36239C16.4437 5.13032 16.0502 5.00399 15.646 5.00004H8.4C7.9925 4.99068 7.59188 5.10605 7.25177 5.3307C6.91166 5.55536 6.64832 5.87856 6.497 6.25704L5 10M19 10H5M19 10C20.1046 10 21 10.8954 21 12V16C21 17.1046 20.1046 18 19 18M5 10L3 8.00004M5 10C3.89543 10 3 10.8954 3 12V16C3 17.1046 3.89543 18 5 18M7 14H7.01M17 14H17.01M19 18H5M19 18V20M5 18V20" />
      </svg>
    ),
  },
]

const VALUES: { title: string; body: string }[] = [
  {
    title: 'Closed by design',
    body: 'Every ride lives inside a community. Access comes from a code you were given, not an open marketplace anyone can enter.',
  },
  {
    title: 'No fare, no cut',
    body: 'Veesaa is for coordination, not profit on the ride. Neighbours help neighbours get there, and we stay out of the middle.',
  },
  {
    title: 'Built with communities',
    body: 'We grow one community at a time, listening closely, so the product fits how real groups already move.',
  },
  {
    title: 'Safety you can see',
    body: 'Real profiles, community-only matching, and clear pickup details mean you always know who you are travelling with.',
  },
]
