'use client'

import { useEffect, useState } from 'react'
import SiteHeader from '@/components/SiteHeader'
import Footer from '@/components/Footer'
import { getExperiences, type Experience } from '@/lib/experiences'
import ExperienceCard from '@/components/ExperienceCard'

export default function ExperiencesPage() {
  const [items, setItems] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getExperiences(false).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />

      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-3">
          <span className="text-sm font-semibold text-black">Experiences</span>
        </div>
      </div>

      {/* Mini hero */}
      <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white px-5 py-14 text-center">
        <p className="text-[11px] font-bold uppercase text-blue-600">Loved by communities</p>
        <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight text-black md:text-4xl">
          Experiences from our members
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500">
          Real stories from neighbours who get there together on Veesaa.
        </p>
      </div>

      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 md:px-8">
        {loading ? (
          <p className="py-12 text-center text-sm text-gray-400">Loading…</p>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">No experiences shared yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t, i) => (
              <ExperienceCard key={t.id} item={t} index={i} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
