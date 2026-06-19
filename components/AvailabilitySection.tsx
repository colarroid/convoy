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

const STEPS = [
  { title: 'Enter your community code', desc: 'Your access pass to a trusted circle.' },
  { title: 'Offer or find a ride', desc: 'Match with people heading your way.' },
  { title: 'Travel together, free', desc: 'No fares, no commission. Ever.' },
]

/** Connected, dashed-line capability cards (right column) with hover effects. */
function ConnectedCards() {
  return (
    <div className="relative py-2">
      {/* broken connector line through the cards */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-white/15"
      />
      <div className="relative flex flex-col gap-9">
        {STEPS.map((s, i) => (
          <div key={i} className="group relative">
            {/* node on the line */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-20 w-8 h-8 rounded-full bg-neutral-800 ring-1 ring-white/10 flex items-center justify-center text-xs font-bold text-white transition-all duration-300 group-hover:bg-green-500 group-hover:text-black group-hover:ring-green-400 group-hover:scale-110">
              {i + 1}
            </div>
            <div className="relative rounded-2xl bg-neutral-900 ring-1 ring-white/10 px-6 pt-8 pb-5 text-center shadow-xl transition-all duration-300 group-hover:-translate-y-1.5 group-hover:ring-green-500/40 group-hover:shadow-[0_16px_50px_-12px_rgba(34,197,94,0.35)]">
              <p className="font-bold text-white">{s.title}</p>
              <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** "Where Veesaa is live" + a bring-it-to-your-community waitlist (visual only for now). */
export default function AvailabilitySection() {
  const [community, setCommunity] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)   // visual only, not stored yet
  }

  const inputCls =
    'px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all'

  return (
    <section className="relative bg-neutral-950 text-white py-24 md:py-32 px-5 md:px-8 overflow-hidden">
      <div className="pointer-events-none absolute -top-24 right-[-10%] w-[42rem] h-[42rem] rounded-full bg-green-500/10 blur-[120px]" />

      <div className="relative max-w-5xl mx-auto grid md:grid-cols-2 gap-14 md:gap-24 items-center">
        {/* Availability + waitlist */}
        <div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Where Veesaa is live
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">We grow one community at a time. Trust first, reach second.</p>

          <div className="border-t border-b border-white/10 divide-y divide-white/10 mb-9">
            <LiveRow flag="🇳🇬" name="Nigeria" />
            <LiveRow flag="🇨🇦" name="Canada" />
          </div>

          <p className="text-sm font-semibold text-white mb-1">Bring Veesaa to your community</p>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">Not live near you yet? Tell us where, and we&apos;ll reach out when Veesaa lands in your community.</p>

          {submitted ? (
            <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 ring-1 ring-green-500/20 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              You&apos;re on the list. We&apos;ll be in touch.
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

        {/* Connected capability cards */}
        <ConnectedCards />
      </div>
    </section>
  )
}
