'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getExperiences, type Experience } from '@/lib/experiences'

const initials = (name: string | null) =>
  (name ?? '?').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export default function TestimonialsSection() {
  const [items, setItems] = useState<Experience[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    getExperiences(true).then(setItems).catch(() => {}).finally(() => setReady(true))
  }, [])

  // Nothing pinned yet -> don't render an empty section.
  if (!ready || items.length === 0) return null

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
          <Link
            href="/experiences"
            className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gray-100"
          >
            View more
          </Link>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 7).map((t) => (
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
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-black">{t.name ?? 'Veesaa member'}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
