'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getExperiences, type Experience } from '@/lib/experiences'
import ExperienceCard from '@/components/ExperienceCard'

// Placeholder content, shown only until real pinned experiences exist. As soon
// as MIN_REAL members have shared theirs, these are replaced entirely.
const MIN_REAL = 2
const DEMO: Experience[] = [
  {
    id: 'demo-1',
    name: 'Amara O.',
    photo_url: null,
    created_at: '',
    body: "I never knew two people from my church lived in my area. Now I'm more motivated to go every Sunday morning, because there's always someone to go with.",
  },
  {
    id: 'demo-2',
    name: 'Tunde A.',
    photo_url: null,
    created_at: '',
    body: "Got a free ride in under five minutes. A neighbour had a spare seat, we met at the pickup point, and that was that. What a way to connect with someone you already know but have never really chatted with.",
  },
]

export default function TestimonialsSection() {
  const [pinned, setPinned] = useState<Experience[]>([])

  useEffect(() => {
    getExperiences(true).then(setPinned).catch(() => {})
  }, [])

  const useReal = pinned.length >= MIN_REAL
  const items = (useReal ? pinned : DEMO).slice(0, 7)

  return (
    <section className="bg-white px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600">Loved by communities</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-black md:text-5xl">
              Neighbours, getting<br className="hidden md:block" /> there together.
            </h2>
          </div>
          {useReal && (
            <Link
              href="/experiences"
              className="group inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-black transition-all hover:border-black hover:bg-black hover:text-white"
            >
              View more
              <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          )}
        </div>

        {/* Columns follow the count, so two cards don't leave an empty third. */}
        <div className={`mt-12 grid gap-5 sm:grid-cols-2 md:mt-14 ${items.length > 2 ? 'lg:grid-cols-3' : ''}`}>
          {items.map((t, i) => (
            <ExperienceCard key={t.id} item={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
