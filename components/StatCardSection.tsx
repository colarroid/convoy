'use client'

import { useState } from 'react'

const STEPS = [
  {
    n: '01',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 8.00004L19 10M19 10L17.5 6.30004C17.3585 5.92138 17.1057 5.59446 16.7747 5.36239C16.4437 5.13032 16.0502 5.00399 15.646 5.00004H8.4C7.9925 4.99068 7.59188 5.10605 7.25177 5.3307C6.91166 5.55536 6.64832 5.87856 6.497 6.25704L5 10M19 10H5M19 10C20.1046 10 21 10.8954 21 12V16C21 17.1046 20.1046 18 19 18M5 10L3 8.00004M5 10C3.89543 10 3 10.8954 3 12V16C3 17.1046 3.89543 18 5 18M7 14H7.01M17 14H17.01M19 18H5M19 18V20M5 18V20" />
      </svg>
    ),
    title: 'Offer or find a ride',
    desc: "Post the seats you've got, or search for a ride to a shared destination.",
  },
  {
    n: '02',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21M16 3.12793C16.8578 3.3503 17.6174 3.85119 18.1597 4.55199C18.702 5.25279 18.9962 6.11382 18.9962 6.99993C18.9962 7.88604 18.702 8.74707 18.1597 9.44787C17.6174 10.1487 16.8578 10.6496 16 10.8719M22 20.9999V18.9999C21.9993 18.1136 21.7044 17.2527 21.1614 16.5522C20.6184 15.8517 19.8581 15.3515 19 15.1299M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" />
      </svg>
    ),
    title: 'Match inside your circle',
    desc: 'Get connected with verified members of your own community.',
  },
  {
    n: '03',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 10C20 14.993 14.461 20.193 12.601 21.799C12.4277 21.9293 12.2168 21.9998 12 21.9998C11.7832 21.9998 11.5723 21.9293 11.399 21.799C9.539 20.193 4 14.993 4 10C4 7.87827 4.84285 5.84344 6.34315 4.34315C7.84344 2.84285 9.87827 2 12 2C14.1217 2 16.1566 2.84285 17.6569 4.34315C19.1571 5.84344 20 7.87827 20 10Z" />
        <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" />
      </svg>
    ),
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
            <span className="text-blue-600">{s.icon}</span>
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
