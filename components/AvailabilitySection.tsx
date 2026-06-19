'use client'

import { useState } from 'react'

function LiveRow({ flag, name }: { flag: string; name: string }) {
  return (
    <div className="flex items-center justify-between py-4">
      <span className="flex items-center gap-3">
        <span className="text-xl">{flag}</span>
        <span className="font-bold text-black">{name}</span>
      </span>
      <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
        Live
      </span>
    </div>
  )
}

function Capability({ title, desc, dark }: { title: string; desc: string; dark?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border ${dark ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-200'}`}>
      <p className="text-lg font-bold">{title}</p>
      <p className={`text-sm mt-1 ${dark ? 'text-gray-300' : 'text-gray-500'}`}>{desc}</p>
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
    setSubmitted(true)   // visual only — not stored yet
  }

  return (
    <section className="bg-white py-20 md:py-28 px-5 md:px-8 border-t border-gray-100">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-start">
        {/* Availability + waitlist */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight mb-3">Where Veesaa is live</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">We grow one community at a time — trust first, reach second.</p>

          <div className="border-t border-b border-gray-100 divide-y divide-gray-100 mb-8">
            <LiveRow flag="🇳🇬" name="Nigeria" />
            <LiveRow flag="🇨🇦" name="Canada" />
          </div>

          <p className="text-sm font-semibold text-black mb-1">Bring Veesaa to your community</p>
          <p className="text-sm text-gray-400 mb-4 leading-relaxed">Not live near you yet? Tell us where, and we&apos;ll reach out when Veesaa lands in your community.</p>

          {submitted ? (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              You&apos;re on the list — we&apos;ll be in touch.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-2.5">
              <input
                value={community}
                onChange={e => setCommunity(e.target.value)}
                placeholder="Your community or city"
                className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
              />
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                />
                <button type="submit" className="px-5 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all shrink-0">
                  Notify me
                </button>
              </div>
            </form>
          )}
        </div>

        {/* What you can do */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">What you can do</p>
          <Capability title="Offer a ride" desc="Share your route and bring your community along." dark />
          <Capability title="Find a ride" desc="Join someone already heading your way." />
          <Capability title="Travel together — free" desc="No fares, no commission. Ever." />
        </div>
      </div>
    </section>
  )
}
