'use client'

import Link from 'next/link'
import { useState } from 'react'

interface NavbarProps {
  showAuth?: 'login' | 'signup' | 'both'
}

export default function Navbar({ showAuth = 'both' }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-black">
      <div className="max-w-6xl mx-auto px-5 md:px-8 flex items-center justify-between h-14 md:h-16">

        {/* Logo + nav links grouped on the left */}
        <div className="flex items-center" style={{ gap: '60px' }}>
          <Link href="/" className="text-lg font-semibold tracking-tight text-white">
            Veesaa
          </Link>

          {/* Desktop nav links, landing page only */}
          {showAuth === 'both' && (
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/#about"        className="nav-pill">About</Link>
              <Link href="/#how-it-works" className="nav-pill">How it works</Link>
              <Link href="/contact"       className="nav-pill">Contact</Link>
            </nav>
          )}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/help" className="nav-pill">Help</Link>

          {/* When both are shown, Log in is a plain pill and Sign up the CTA.
              When only one is shown, that one is the prominent white CTA. */}
          {showAuth === 'both' && (
            <Link href="/login" className="nav-pill">Log in</Link>
          )}

          {(showAuth === 'both' || showAuth === 'signup') && (
            <Link
              href="/signup"
              className="ml-1 text-sm px-3 py-2.5 rounded-full font-semibold bg-white text-black
                         hover:bg-white/85 transition-all duration-150"
            >
              Sign up
            </Link>
          )}

          {showAuth === 'login' && (
            <Link
              href="/login"
              className="ml-1 text-sm px-3 py-2.5 rounded-full font-semibold bg-white text-black
                         hover:bg-white/85 transition-all duration-150"
            >
              Log in
            </Link>
          )}
        </div>

        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/help" className="text-sm text-white/70 hover:text-white transition-colors px-2 py-1.5">Help</Link>

          {(showAuth === 'both' || showAuth === 'signup') && (
            <Link
              href="/signup"
              className="text-sm px-3 py-2.5 rounded-full font-semibold bg-white text-black
                         hover:bg-white/85 transition-all"
            >
              Sign up
            </Link>
          )}
          {showAuth === 'login' && (
            <Link
              href="/login"
              className="text-sm px-3 py-2.5 rounded-full font-semibold bg-white text-black
                         hover:bg-white/85 transition-all"
            >
              Log in
            </Link>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-white rounded-lg hover:bg-white/10 transition-colors"
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
        <div className="md:hidden bg-black border-t border-white/10 px-5 pb-5 pt-3 flex flex-col gap-1">
          {showAuth === 'both' && (
            <>
              <Link href="/#about"        className="mobile-nav-link" onClick={() => setMenuOpen(false)}>About</Link>
              <Link href="/#how-it-works" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>How it works</Link>
              <Link href="/contact"       className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Contact</Link>
            </>
          )}

          <div className="border-t border-white/10 mt-3 pt-4 flex gap-3">
            <Link
              href="/login"
              className="flex-1 text-center py-2.5 text-sm font-medium rounded-xl border border-white/20 text-white hover:bg-white/10 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="flex-1 text-center py-2.5 text-sm font-medium rounded-xl bg-white text-black hover:bg-gray-100 transition-colors"
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
