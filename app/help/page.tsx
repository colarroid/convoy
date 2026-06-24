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
        <div className="mt-8 rounded-3xl bg-[#0b1120] px-6 py-10 md:px-10 md:py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Still need help?</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <Link
              href="mailto:hello@veesaa.co"
              className="rounded-2xl ring-1 ring-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-colors"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </span>
              <p className="mt-5 font-bold text-white">Email</p>
              <p className="mt-1 text-sm text-gray-400">hello@veesaa.co</p>
            </Link>

            <Link
              href="https://wa.me/2348000000000"
              className="rounded-2xl ring-1 ring-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-colors"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 1.67c2.2 0 4.27.86 5.82 2.42a8.2 8.2 0 012.42 5.82c0 4.54-3.7 8.23-8.24 8.23-1.52 0-3.01-.41-4.3-1.19l-.31-.18-3.12.82.83-3.04-.2-.32a8.2 8.2 0 01-1.26-4.36c0-4.54 3.7-8.24 8.24-8.24zm-4.71 4.4c-.22 0-.58.08-.89.42-.3.33-1.16 1.13-1.16 2.76s1.19 3.2 1.36 3.42c.16.22 2.33 3.56 5.65 4.86 2.76 1.09 3.32.87 3.92.82.6-.06 1.93-.79 2.2-1.55.27-.76.27-1.41.19-1.55-.08-.13-.3-.22-.63-.38-.33-.16-1.93-.95-2.23-1.06-.3-.11-.52-.16-.73.17-.22.33-.84 1.06-1.03 1.27-.19.22-.38.25-.71.08-.33-.16-1.39-.51-2.64-1.63-.98-.87-1.64-1.95-1.83-2.28-.19-.33-.02-.51.14-.67.15-.15.33-.38.49-.58.16-.19.22-.33.33-.55.11-.22.05-.41-.03-.58-.08-.16-.73-1.77-1.02-2.42-.27-.64-.54-.55-.73-.56l-.62-.01z" />
                </svg>
              </span>
              <p className="mt-5 font-bold text-white">WhatsApp</p>
              <p className="mt-1 text-sm text-gray-400">+234 800 000 0000</p>
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
