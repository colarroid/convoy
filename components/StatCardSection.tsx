'use client'

import { useState } from 'react'

const STEPS = [
  {
    n: '01',
    title: 'Offer or find a ride',
    desc: "Post the seats you've got, or search for a ride to a shared destination.",
  },
  {
    n: '02',
    title: 'Match inside your circle',
    desc: 'Get connected with verified members of your own community.',
  },
  {
    n: '03',
    title: 'Travel together',
    desc: 'Meet at the pickup point and share the journey.',
  },
]

interface StatCardSectionProps {
  headline?: string
  body?: string
  ctaLabel?: string
  /** YouTube embed URL (e.g. https://www.youtube.com/embed/VIDEO_ID). Empty shows a placeholder. */
  videoUrl?: string
  statPrefix?: string
  statValue?: string
  statSuffix?: string
  statCaption?: string
}

/**
 * Bolt-style highlight card: bold headline + body + play CTA on the left,
 * a large stat on the right, a lightning glyph top-right. Responsive:
 * two columns on desktop, stacked on mobile. Pass content via props.
 */
export default function StatCardSection({
  headline = 'The best conversations start on the way there',
  body = "Every shared ride is more than a trip to a destination, it's an opportunity to break the ice, start a conversation, and bring people closer together.",
  ctaLabel = 'Watch introduction',
  videoUrl = '',
  statPrefix = '',
  statValue = '12.4',
  statSuffix = 'K',
  statCaption = 'Miles shared on Veesaa',
}: StatCardSectionProps) {
  const [open, setOpen] = useState(false)

  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-24">
      {/* How it works: three steps above the card */}
      <div className="mx-auto mb-12 grid max-w-5xl gap-8 sm:grid-cols-3 sm:gap-10 md:mb-16">
        {STEPS.map((s) => (
          <div key={s.n}>
            <p className="text-sm font-bold text-blue-600">{s.n}</p>
            <p className="mt-3 text-base font-bold text-[#0a0a23]">{s.title}</p>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-[#5b6486]">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-5xl rounded-[28px] bg-[#f5f4f1] px-7 py-9 sm:px-10 sm:py-12 md:px-16 md:py-16">
        <div className="grid items-center gap-10 md:grid-cols-[1.5fr_1fr] md:gap-12">
          {/* Left: headline, body, CTA */}
          <div className="relative">
            {/* lightning glyph, top-right of the whole card on desktop */}
            <h2 className="text-[28px] font-extrabold leading-[1.1] tracking-tight text-[#0a0a23] sm:text-4xl md:text-[44px]">
              {headline}
            </h2>
            <p className="mt-5 max-w-md text-[0.95rem] font-medium leading-relaxed text-[#3a3a52]">
              {body}
            </p>

            {ctaLabel && (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="group mt-8 inline-flex items-center gap-3 text-[#0a0a23] sm:mt-12"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e3e4f0] transition-colors group-hover:bg-[#0a0a23] group-hover:text-white">
                  <svg className="ml-0.5 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </span>
                <span className="font-semibold">{ctaLabel}</span>
              </button>
            )}
          </div>

          {/* Right: lightning glyph + big stat */}
          <div className="flex flex-col items-start md:items-end">
            <svg className="mb-6 h-7 w-7 text-blue-600 md:mb-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13z" />
            </svg>

            <div className="flex items-start leading-none text-[#0a0a23]">
              <span className="mt-2 text-3xl font-bold sm:mt-3 sm:text-4xl">{statPrefix}</span>
              <span className="text-[64px] font-extrabold tracking-tight sm:text-[88px] md:text-[104px]">{statValue}</span>
              <span className="mt-2 self-end pb-2 text-3xl font-bold sm:text-4xl">{statSuffix}</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-blue-700 md:text-base">{statCaption}</p>
          </div>
        </div>
      </div>

      {/* Video modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 text-sm font-medium text-white/70 hover:text-white"
            >
              Close
            </button>
            <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-neutral-900 ring-1 ring-white/10">
              {videoUrl ? (
                <iframe
                  src={videoUrl}
                  title="Veesaa demo"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="px-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                    <svg className="ml-0.5 h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                  <p className="font-semibold text-white">Demo video coming soon</p>
                  <p className="mt-1 text-sm text-gray-400">We&apos;re putting the finishing touches on it.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
