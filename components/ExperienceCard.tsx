'use client'

import type { Experience } from '@/lib/experiences'

const initials = (name: string | null) =>
  (name ?? '?').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

// Soft, cohesive tones cycled across the wall of cards.
const TONES = ['#c5ccf2', '#d9e3f6', '#e4ddf4', '#cfe7d8']

export default function ExperienceCard({ item, index = 0 }: { item: Experience; index?: number }) {
  const bg = TONES[index % TONES.length]
  return (
    <figure className="flex h-full flex-col rounded-3xl p-8 md:p-9" style={{ backgroundColor: bg }}>
      {/* bold quote glyph */}
      <svg viewBox="0 0 512 512" className="mb-6 h-7 w-7 shrink-0" fill="#2563eb" aria-hidden>
        <path d="M464 256h-80v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8c-88.4 0-160 71.6-160 160v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48zm-288 0H96v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8C71.6 32 0 103.6 0 192v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48z" />
      </svg>

      <blockquote className="flex-1 text-lg font-semibold leading-snug tracking-tight text-[#0a0a23] md:text-xl">
        {item.body}
      </blockquote>

      <figcaption className="mt-7 flex items-center gap-3">
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0a0a23] text-[11px] font-bold text-white">
          {initials(item.name)}
          {item.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.photo_url} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          )}
        </span>
        <span className="truncate text-sm font-bold text-[#0a0a23]">{item.name ?? 'Veesaa member'}</span>
      </figcaption>
    </figure>
  )
}
