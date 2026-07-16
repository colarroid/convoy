'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getExperiences, type Experience } from '@/lib/experiences'
import ExperienceCard from '@/components/ExperienceCard'

// Placeholder content shown until at least MIN_REAL pinned experiences exist.
const MIN_REAL = 3
const DEMO: Experience[] = [
  { id: 'demo-1', name: 'Amara O.', photo_url: null, created_at: '', body: 'I drive the same route every week with three empty seats. Now I post the trip with our community code and neighbours ride along. Same journey, better company.' },
  { id: 'demo-2', name: 'Tunde A.', photo_url: null, created_at: '', body: 'I used to guess who was going. Now I enter our code, see who is already heading there, and ask for a seat. Sorted in under a minute.' },
  { id: 'demo-3', name: 'Chidinma E.', photo_url: null, created_at: '', body: 'The host approves who gets in, and everyone holds the same community code. I always know exactly who I am travelling with.' },
  { id: 'demo-4', name: 'Daniel M.', photo_url: null, created_at: '', body: 'Four of us from work live on the same side of town. One code, one destination, and now it is one car instead of four.' },
  { id: 'demo-5', name: 'Kemi B.', photo_url: null, created_at: '', body: 'I never type an address. The code already knows where we are going, so I just set my pickup point and show up.' },
  { id: 'demo-6', name: 'Sarah L.', photo_url: null, created_at: '', body: 'It genuinely costs nothing. A neighbour had a spare seat, we met at the pickup point, and that was that.' },
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

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 md:mt-14">
          {items.map((t, i) => (
            <ExperienceCard key={t.id} item={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
