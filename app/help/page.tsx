'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import AppNav from '@/components/AppNav'
import Footer from '@/components/Footer'
import ReportModal from '@/components/ReportModal'
import { getUser } from '@/lib/userStore'

const TOPICS = [
  {
    icon: '🚗',
    title: 'Offering a ride',
    links: [
      'How do I offer a ride?',
      'Can I edit a ride after posting?',
      'How do I cancel a ride I offered?',
      'How do I approve or decline requests?',
      'What if I\'m using a hired ride (Uber / Bolt / In-drive)?',
    ],
  },
  {
    icon: '🔍',
    title: 'Finding a ride',
    links: [
      'How do I find a ride?',
      'How do I request to join a ride?',
      'What happens after I send a request?',
      'Can I cancel my request?',
      'What if there are no rides on my route?',
    ],
  },
  {
    icon: '🏘️',
    title: 'Communities & codes',
    links: [
      'What is a community code?',
      'Where do I get a community code?',
      'Do I need to enter the code every time?',
      'Who creates community codes?',
      'My community code isn\'t working',
    ],
  },
  {
    icon: '👤',
    title: 'Account & profile',
    links: [
      'How do I change my profile photo?',
      'How do I update my phone number?',
      'How do I change my password?',
      'How do I delete my account?',
      'Why do I need to verify my email?',
    ],
  },
  {
    icon: '🔒',
    title: 'Safety & trust',
    links: [
      'Is Veesaa safe to use?',
      'Who can see my personal information?',
      'Why do I only share a pickup point, not my address?',
      'How does Veesaa build trust without ratings?',
      'How do I report a concern?',
    ],
  },
  {
    icon: '💳',
    title: 'Is it really free?',
    links: [
      'Is Veesaa really free?',
      'Does Veesaa take a cut from rides?',
      'Can a host charge for a ride?',
      'Are there any hidden fees?',
    ],
  },
]

const ALL_LINKS = TOPICS.flatMap(t => t.links)

export default function HelpPage() {
  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => { setLoggedIn(!!getUser()) }, [])

  const results = query.trim().length > 1
    ? ALL_LINKS.filter(l => l.toLowerCase().includes(query.toLowerCase()))
    : []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearched(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {loggedIn ? <AppNav /> : <Navbar showAuth="login" />}

      {/* Sub-header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-3">
          <span className="text-sm font-semibold text-black">Help</span>
        </div>
      </div>

      {/* Hero */}
      <div className="border-b border-gray-100 py-14 px-5 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">
          How can we help?
        </h1>
        <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed mb-8">
          Search our help topics or browse the categories below to find answers
          and fix issues with offering rides, finding rides, your account, and more.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex items-stretch max-w-xl mx-auto shadow-sm">
          <div className="flex-1 flex items-center gap-3 bg-gray-100 px-4 rounded-l-xl border border-gray-200 border-r-0">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setSearched(false) }}
              placeholder="Search questions, keywords, topics"
              className="flex-1 bg-transparent py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 bg-black text-white text-sm font-bold rounded-r-xl hover:bg-gray-800 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Search results */}
        {(searched || query.trim().length > 1) && (
          <div className="max-w-xl mx-auto mt-3 text-left">
            {results.length > 0 ? (
              <ul className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {results.map(r => (
                  <li key={r}>
                    <button className="w-full px-4 py-3 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center justify-between gap-2 border-b border-gray-100 last:border-0">
                      {r}
                      <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 text-center py-3">No results for &ldquo;{query}&rdquo;</p>
            )}
          </div>
        )}
      </div>

      {/* Topics grid */}
      <div className="max-w-5xl mx-auto w-full px-5 md:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOPICS.map(topic => (
            <div key={topic.title} className="border border-gray-200 rounded-2xl p-5 hover:border-gray-400 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-xl">{topic.icon}</span>
                <h2 className="text-sm font-bold text-black">{topic.title}</h2>
              </div>
              <ul className="space-y-2">
                {topic.links.map(link => (
                  <li key={link}>
                    <button className="w-full text-left text-sm text-gray-500 hover:text-black flex items-center justify-between gap-2 group transition-colors py-0.5">
                      <span className="group-hover:underline underline-offset-2">{link}</span>
                      <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Report a concern */}
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-black mb-0.5">Report a safety concern</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Tell us about a member or ride. Confidential. In an emergency, call local authorities.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowReport(true)}
            className="shrink-0 px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors"
          >
            Report
          </button>
        </div>

        {/* Still need help — direct channels */}
        <div className="mt-8 rounded-3xl border border-gray-200 bg-gray-50 px-6 py-10 md:px-10 md:py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-black">Still need help?</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <Link
              href="mailto:hello@veesaa.co"
              className="rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-sm"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </span>
              <p className="mt-5 font-bold text-black">Email</p>
              <p className="mt-1 text-sm text-gray-500">hello@veesaa.co</p>
            </Link>

            {/* WhatsApp: hover reveals a QR to scan (drop the image in at /whatsapp-qr.png) */}
            <Link
              href="https://wa.me/2348000000000"
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-sm"
            >
              {/* small QR glyph, hint that a scan is available */}
              <span className="absolute right-5 top-5 text-gray-300 transition-opacity group-hover:opacity-0">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5h4.5v4.5h-4.5zM15.75 4.5h4.5v4.5h-4.5zM3.75 15h4.5v4.5h-4.5zM15.75 15h2.25M20.25 15v4.5M15.75 19.5h2.25" />
                </svg>
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </span>
              <p className="mt-5 font-bold text-black">WhatsApp</p>
              <p className="mt-1 text-sm text-gray-500">+234 800 000 0000</p>

              {/* Scan overlay (revealed on hover) */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-5 bg-white/95 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
                <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-white text-[10px] font-medium uppercase tracking-wider text-gray-400">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/whatsapp-qr.png" alt="" className="absolute inset-0 h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  QR code
                </div>
                <div className="text-left">
                  <p className="font-bold text-black">Scan to chat</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <ReportModal open={showReport} onClose={() => setShowReport(false)} />

      {/* Footer */}
      <Footer />
    </div>
  )
}
