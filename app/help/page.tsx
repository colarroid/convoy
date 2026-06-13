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
      'Is Convoy safe to use?',
      'Who can see my personal information?',
      'Why do I only share a pickup point, not my address?',
      'How does Convoy build trust without ratings?',
      'How do I report a concern?',
    ],
  },
  {
    icon: '💳',
    title: 'Is it really free?',
    links: [
      'Is Convoy really free?',
      'Does Convoy take a cut from rides?',
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

        {/* Contact strip */}
        <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-200 px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-black mb-0.5">Still need help?</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Reach your community admin or send us a message and we&apos;ll get back to you.
            </p>
          </div>
          <Link
            href="mailto:support@convoy.app"
            className="shrink-0 px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            Contact support
          </Link>
        </div>
      </div>

      <ReportModal open={showReport} onClose={() => setShowReport(false)} />

      {/* Footer */}
      <Footer />
    </div>
  )
}
