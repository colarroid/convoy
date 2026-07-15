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
        <div className="flex items-center" style={{ gap: '60px' }}>
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/veesaa-logo-black.svg" alt="Veesaa" className="h-[20px] w-auto" />
          </Link>

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

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-5 pb-5 pt-3 flex flex-col gap-1">
          <div className="flex gap-3">
            <Link
              href="/login"
              className="flex-1 text-center py-2.5 text-sm font-medium rounded-xl border border-gray-300 text-black hover:bg-gray-100 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="flex-1 text-center py-2.5 text-sm font-medium rounded-xl bg-black text-white hover:bg-gray-800 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
