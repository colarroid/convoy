'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { getUser, getInitials, getDisplayName } from '@/lib/userStore'
import { signOut } from '@/lib/auth'
import { getUnreadCount } from '@/lib/notifications'
import { supabase } from '@/lib/supabase'
import SuspendedBanner from '@/components/SuspendedBanner'

const LINKS = [
  { href: '/',         label: 'Home' },
  { href: '/my-trips', label: 'My trips' },
  { href: '/help',     label: 'Help' },
]

export default function AppNav() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [initials, setInitials] = useState('?')
  const [photo, setPhoto]       = useState<string | null>(null)
  const [name, setName]         = useState('Your account')
  const [email, setEmail]       = useState('')
  const [unread, setUnread]     = useState(0)
  const avatarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const u = getUser()
    setInitials(getInitials(u))
    setPhoto(u?.photoDataUrl ?? null)
    setName(u ? getDisplayName(u) : 'Your account')
    setEmail(u?.email ?? '')
    getUnreadCount().then(setUnread).catch(() => {})
  }, [])

  // Live badge: subscribe to new notifications for this user.
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null
    let cancelled = false
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled || !user) return
      // Unique channel name per mount so a fresh subscription never reuses an
      // already-subscribed channel (which throws "after subscribe()").
      channel = supabase
        .channel(`notif-${user.id}-${Math.random().toString(36).slice(2)}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          () => setUnread(u => u + 1),
        )
        .subscribe()
    })
    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  // Close the desktop avatar dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const Avatar = (
    photo
      ? <img src={photo} alt="avatar" className="w-full h-full object-cover" />
      : <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-semibold">{initials}</div>
  )

  return (
    <>
    <SuspendedBanner />
    <header className="sticky top-0 z-50 bg-white border-b border-[#2727271a]">
      <div className="max-w-6xl mx-auto px-5 md:px-8 flex items-center justify-between h-14 md:h-16">

        {/* Logo + links grouped on the left */}
        <div className="flex items-center" style={{ gap: '60px' }}>
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/veesaa-logo-black.svg" alt="Veesaa" className="h-[20px] w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} className="nav-pill-light">{l.label}</Link>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">

          {/* ── Notifications bell ── */}
          <Link
            href="/notifications"
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M10.2679 21C10.4435 21.304 10.696 21.5565 11 21.732C11.304 21.9075 11.6489 21.9999 11.9999 21.9999C12.351 21.9999 12.6959 21.9075 12.9999 21.732C13.3039 21.5565 13.5564 21.304 13.7319 21M3.262 15.326C3.13137 15.4692 3.04516 15.6472 3.01386 15.8385C2.98256 16.0298 3.00752 16.226 3.08571 16.4034C3.1639 16.5807 3.29194 16.7316 3.45426 16.8375C3.61658 16.9434 3.80618 16.9999 4 17H20C20.1938 17.0001 20.3834 16.9438 20.5459 16.8381C20.7083 16.7324 20.8365 16.5817 20.9149 16.4045C20.9933 16.2273 21.0185 16.0311 20.9874 15.8398C20.9564 15.6485 20.8704 15.4703 20.74 15.327C19.41 13.956 18 12.499 18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 12.499 4.589 13.956 3.262 15.326Z" />
            </svg>
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>

          {/* ── Desktop: avatar dropdown ── */}
          <div ref={avatarRef} className="hidden md:block relative">
            <button
              onClick={() => setAvatarOpen(o => !o)}
              className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-gray-200 hover:ring-gray-300 transition-all shrink-0"
              aria-label="Account menu"
            >
              {Avatar}
            </button>

            {avatarOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden
                              origin-top-right animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 shrink-0">{Avatar}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-black truncate">{name}</p>
                    {email && <p className="text-xs text-gray-400 truncate">{email}</p>}
                  </div>
                </div>
                <div className="py-1">
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setAvatarOpen(false)}>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 21V19C19 17.9391 18.5786 16.9217 17.8284 16.1716C17.0783 15.4214 16.0609 15 15 15H9C7.93913 15 6.92172 15.4214 6.17157 16.1716C5.42143 16.9217 5 17.9391 5 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" /></svg>
                    Profile
                  </Link>
                  <Link href="/my-trips" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setAvatarOpen(false)}>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 8.00004L19 10M19 10L17.5 6.30004C17.3585 5.92138 17.1057 5.59446 16.7747 5.36239C16.4437 5.13032 16.0502 5.00399 15.646 5.00004H8.4C7.9925 4.99068 7.59188 5.10605 7.25177 5.3307C6.91166 5.55536 6.64832 5.87856 6.497 6.25704L5 10M19 10H5M19 10C20.1046 10 21 10.8954 21 12V16C21 17.1046 20.1046 18 19 18M5 10L3 8.00004M5 10C3.89543 10 3 10.8954 3 12V16C3 17.1046 3.89543 18 5 18M7 14H7.01M17 14H17.01M19 18H5M19 18V20M5 18V20" /></svg>
                    My trips
                  </Link>
                </div>
                <div className="py-1 border-t border-gray-100">
                  <button onClick={() => { setAvatarOpen(false); handleSignOut() }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 4V11C20 12.0609 19.5786 13.0783 18.8284 13.8284C18.0783 14.5786 17.0609 15 16 15H4M9 20L4 15L9 10" /></svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Mobile: avatar (link) + hamburger ── */}
          <Link
            href="/profile"
            className="md:hidden w-8 h-8 rounded-full overflow-hidden ring-2 ring-gray-200 transition-all shrink-0"
          >
            {Avatar}
          </Link>

          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden p-1.5 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile slide-down menu + backdrop ── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 top-14 bg-black/40 z-40 animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <div className="md:hidden absolute left-0 right-0 top-14 z-50 bg-white border-t border-[#2727271a] px-4 pb-4 pt-2
                          animate-in slide-in-from-top-2 fade-in duration-200">
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} className="mobile-nav-link-light block" onClick={() => setMobileOpen(false)}>{l.label}</Link>
            ))}
            <Link href="/profile" className="mobile-nav-link-light block" onClick={() => setMobileOpen(false)}>Profile</Link>
            <div className="border-t border-gray-100 mt-3 pt-3">
              <button
                onClick={() => { setMobileOpen(false); handleSignOut() }}
                className="block w-full text-left py-2.5 px-3 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </header>
    </>
  )
}
