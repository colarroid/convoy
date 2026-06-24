'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getExperiences, type Experience } from '@/lib/experiences'

// Placeholder content shown until at least MIN_REAL pinned experiences exist.
const MIN_REAL = 3
const DEMO: Experience[] = [
  { id: 'demo-1', name: 'Amara O.', photo_url: null, created_at: '', body: "I used to drive to service alone every Sunday. Now three of us go together and it's the best part of the morning." },
  { id: 'demo-2', name: 'Tunde A.', photo_url: null, created_at: '', body: 'Match-days are sorted. I ride with people from my estate and we split nothing but good conversation.' },
  { id: 'demo-3', name: 'Chidinma E.', photo_url: null, created_at: '', body: 'As a parent, knowing it is only verified neighbours in the car gives me real peace of mind.' },
]

const initials = (name: string | null) =>
  (name ?? '?').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

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
          {items.map((t) => (
            <figure key={t.id} className="flex flex-col rounded-3xl bg-[#f5f4f1] p-7">
              <blockquote className="flex-1 text-[1.05rem] leading-relaxed text-[#0a0a23]">
                &ldquo;{t.body}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-900 text-xs font-bold text-white">
                  {initials(t.name)}
                  {t.photo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.photo_url} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  )}
                </span>
                <span className="block truncate text-sm font-bold text-black">{t.name ?? 'Veesaa member'}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
