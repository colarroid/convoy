'use client'

import { useState } from 'react'

function LiveRow({ flag, name }: { flag: string; name: string }) {
  return (
    <div className="flex items-center justify-between py-4">
      <span className="flex items-center gap-3">
        <span className="text-xl">{flag}</span>
        <span className="font-semibold text-white">{name}</span>
      </span>
      <span className="flex items-center gap-2 text-sm font-medium text-green-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
        </span>
        Live
      </span>
    </div>
  )
}

// Full class literals (Tailwind needs to see them) for the fanned card stack.
const CARDS = [
  { title: 'Offer a ride', desc: 'Share your route and bring your community along.', base: 'bg-white text-black', rot: 'md:-rotate-3', mt: '' },
  { title: 'Find a ride', desc: 'Join someone already heading your way.', base: 'bg-neutral-900 text-white ring-1 ring-white/10', rot: 'md:rotate-2', mt: 'md:-mt-5' },
  { title: 'Travel together — free', desc: 'No fares, no commission. Ever.', base: 'bg-green-500 text-black', rot: 'md:-rotate-1', mt: 'md:-mt-5' },
]

/** "Where Veesaa is live" + a bring-it-to-your-community waitlist (visual only for now). */
export default function AvailabilitySection() {
  const [community, setCommunity] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)   // visual only — not stored yet
  }

  const inputCls =
    'px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all'

  return (
    <section className="relative bg-neutral-950 text-white py-24 md:py-32 px-5 md:px-8 overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-24 right-[-10%] w-[42rem] h-[42rem] rounded-full bg-green-500/10 blur-[120px]" />

      <div className="relative max-w-5xl mx-auto grid md:grid-cols-2 gap-14 md:gap-20 items-center">
        {/* Availability + waitlist */}
        <div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Where Veesaa is live
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">We grow one community at a time — trust first, reach second.</p>

          <div className="border-t border-b border-white/10 divide-y divide-white/10 mb-9">
            <LiveRow flag="🇳🇬" name="Nigeria" />
            <LiveRow flag="🇨🇦" name="Canada" />
          </div>

          <p className="text-sm font-semibold text-white mb-1">Bring Veesaa to your community</p>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">Not live near you yet? Tell us where, and we&apos;ll reach out when Veesaa lands in your community.</p>

          {submitted ? (
            <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 ring-1 ring-green-500/20 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              You&apos;re on the list — we&apos;ll be in touch.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-2.5">
              <input value={community} onChange={e => setCommunity(e.target.value)} placeholder="Your community or city" className={inputCls} />
              <div className="flex gap-2">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" className={`flex-1 min-w-0 ${inputCls}`} />
                <button type="submit" className="px-5 py-3 bg-white text-black rounded-xl text-sm font-semibold hover:bg-gray-100 active:scale-[0.98] transition-all shrink-0">
                  Notify me
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Fanned capability cards */}
        <div className="flex flex-col gap-4 md:gap-0 md:pl-6">
          {CARDS.map((c, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:!rotate-0 hover:scale-[1.03] hover:z-10 ${c.base} ${c.rot} ${c.mt}`}
            >
              <p className="text-lg font-bold">{c.title}</p>
              <p className="text-sm mt-1 opacity-80">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
