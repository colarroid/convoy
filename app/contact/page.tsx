'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import AppNav from '@/components/AppNav'
import Footer from '@/components/Footer'
import { getUser } from '@/lib/userStore'

const EMAIL = 'hello@veesaa.co'

export default function ContactPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  useEffect(() => { setLoggedIn(!!getUser()) }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {loggedIn ? <AppNav /> : <Navbar showAuth="login" />}

      {/* Sub-header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-3">
          <span className="text-sm font-semibold text-black">Contact</span>
        </div>
      </div>

      {/* Mini hero */}
      <div className="flex flex-1 items-center justify-center px-5 py-20">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            We&apos;d love to hear from you
          </span>
          <h1 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight text-black md:text-5xl">
            Get in touch
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500">
            Questions, feedback, or want to bring Veesaa to your community? Send us a note and
            we&apos;ll get back to you.
          </p>

          <a
            href={`mailto:${EMAIL}`}
            className="mt-8 inline-flex items-center gap-2 text-xl font-bold text-black underline-offset-4 hover:underline md:text-2xl"
          >
            <svg className="h-5 w-5 text-blue-600 md:h-6 md:w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            {EMAIL}
          </a>

          <p className="mt-10 text-xs text-gray-400">
            Already a member? Your community admin can help with most things.{' '}
            <Link href="/help" className="text-gray-600 underline-offset-2 hover:underline">Visit Help</Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
