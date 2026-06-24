'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import AppNav from '@/components/AppNav'
import Footer from '@/components/Footer'
import { getUser } from '@/lib/userStore'
import { getExperiences, type Experience } from '@/lib/experiences'

const initials = (name: string | null) =>
  (name ?? '?').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export default function ExperiencesPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [items, setItems] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoggedIn(!!getUser())
    getExperiences(false).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {loggedIn ? <AppNav /> : <Navbar showAuth="login" />}

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
        )}
      </div>

      <Footer />
    </div>
  )
}
