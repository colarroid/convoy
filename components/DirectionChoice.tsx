'use client'

import type { TripDirection } from '@/lib/trips'

const OPTIONS: {
  value: TripDirection
  label: (place: string) => string
  sub: string
  hostSub: string
  icon: React.ReactNode
}[] = [
  {
    value: 'to_community',
    label: (place) => `To ${place}`,
    sub: 'You are heading there. Tell us where to pick you up.',
    hostSub: 'You are driving there. Tell us where you will pick people up.',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    ),
  },
  {
    value: 'from_community',
    label: (place) => `From ${place}`,
    sub: 'You are heading home. Tell us where you want dropping.',
    hostSub: 'You are driving back. Tell us where you will drop people off.',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M19 12H5M11 18l-6-6 6-6" />
      </svg>
    ),
  },
]

/** Shared to/from picker. The community is always one end of the trip. */
export default function DirectionChoice({
  place,
  value,
  onChange,
  forHost = false,
}: {
  place: string
  value: TripDirection
  onChange: (d: TripDirection) => void
  /** Host wording ("you will pick people up") rather than rider wording. */
  forHost?: boolean
}) {
  return (
    <div className="flex flex-col gap-3">
      {OPTIONS.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all ${
              active
                ? 'border-black bg-black/[0.03] ring-1 ring-black'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className={`mt-0.5 shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`}>{o.icon}</span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-black">{o.label(place)}</span>
              <span className="block text-xs text-gray-500 mt-0.5 leading-relaxed">{forHost ? o.hostSub : o.sub}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
