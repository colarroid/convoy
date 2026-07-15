'use client'

import Link from 'next/link'
import { useState } from 'react'

interface NavbarProps {
  showAuth?: 'login' | 'signup' | 'both'
}

export default function Navbar({ showAuth = 'both' }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#2727271a]">
      <div className="max-w-6xl mx-auto px-5 md:px-8 flex items-center justify-between h-14 md:h-16">

        {/* Logo + nav links grouped on the left */}
        <div className="flex items-center" style={{ gap: '48px' }}>
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/veesaa-logo-black.svg" alt="Veesaa" className="h-[20px] w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/how-it-works" className="nav-pill-light">How it works</Link>
            <Link href="/about" className="nav-pill-light">About</Link>
          </nav>
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/help" className="nav-pill-light">Help</Link>

          {/* When both are shown, Log in is a plain pill and Sign up the CTA.
              When only one is shown, that one is the prominent dark CTA. */}
          {showAuth === 'both' && (
            <Link href="/login" className="nav-pill-light">Log in</Link>
          )}

          {(showAuth === 'both' || showAuth === 'signup') && (
            <Link
              href="/signup"
              className="ml-1 text-sm px-3 py-2.5 rounded-full font-semibold bg-black text-white
                         hover:bg-gray-800 transition-all duration-150"
            >
              Sign up
            </Link>
          )}

          {showAuth === 'login' && (
            <Link
              href="/login"
              className="ml-1 text-sm px-3 py-2.5 rounded-full font-semibold bg-black text-white
                         hover:bg-gray-800 transition-all duration-150"
            >
              Log in
            </Link>
          )}
        </div>

        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/help" className="text-sm text-gray-600 hover:text-black transition-colors px-2 py-1.5">Help</Link>

          {(showAuth === 'both' || showAuth === 'signup') && (
            <Link
              href="/signup"
              className="text-sm px-3 py-2.5 rounded-full font-semibold bg-black text-white
                         hover:bg-gray-800 transition-all"
            >
              Sign up
            </Link>
          )}
          {showAuth === 'login' && (
            <Link
              href="/login"
              className="text-sm px-3 py-2.5 rounded-full font-semibold bg-black text-white
                         hover:bg-gray-800 transition-all"
            >
              Log in
            </Link>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex flex-col bg-white px-5 pb-8 pt-4">
          {/* header: logo + close */}
          <div className="flex h-14 items-center justify-between">
            <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/veesaa-logo-black.svg" alt="Veesaa" className="h-[20px] w-auto" />
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              className="-mr-1.5 rounded-lg p-1.5 text-black transition-colors hover:bg-gray-100"
              aria-label="Close menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* large nav links */}
          <nav className="mt-6 flex flex-col divide-y divide-gray-100 border-t border-b border-gray-100">
            {[
              { href: '/how-it-works', label: 'How it works' },
              { href: '/about', label: 'About' },
              { href: '/help', label: 'Help' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="py-4 text-[26px] font-bold tracking-tight text-black"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* bottom auth actions */}
          <div className="mt-auto flex flex-col items-center gap-4">
            {showAuth === 'login' ? (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="w-full rounded-full bg-black py-4 text-center text-base font-semibold text-white transition-colors hover:bg-gray-800 active:scale-[0.99]"
              >
                Log in
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="w-full rounded-full bg-black py-4 text-center text-base font-semibold text-white transition-colors hover:bg-gray-800 active:scale-[0.99]"
                >
                  Sign up
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-base font-semibold text-black"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
