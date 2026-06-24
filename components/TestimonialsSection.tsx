'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getExperiences, type Experience } from '@/lib/experiences'
import ExperienceCard from '@/components/ExperienceCard'

// Placeholder content shown until at least MIN_REAL pinned experiences exist.
const MIN_REAL = 3
const DEMO: Experience[] = [
  { id: 'demo-1', name: 'Amara O.', photo_url: null, created_at: '', body: "I used to drive to service alone every Sunday. Now three of us go together and it's the best part of the morning." },
  { id: 'demo-2', name: 'Tunde A.', photo_url: null, created_at: '', body: 'Match-days are sorted. I ride with people from my estate and we split nothing but good conversation.' },
  { id: 'demo-3', name: 'Chidinma E.', photo_url: null, created_at: '', body: 'As a parent, knowing it is only verified neighbours in the car gives me real peace of mind.' },
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
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase text-blue-600">Loved by communities</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-black md:text-4xl">
              Neighbours, getting there together.
            </h2>
          </div>
          {useReal && (
            <Link
              href="/experiences"
              className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gray-100"
            >
              View more
            </Link>
          )}
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <ExperienceCard key={t.id} item={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
