'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { getUser, getInitials, getDisplayName } from '@/lib/userStore'
import { signOut } from '@/lib/auth'
import { getUnreadCount } from '@/lib/notifications'
import { supabase } from '@/lib/supabase'

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
      : <div className="w-full h-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold">{initials}</div>
  )

  return (
    <header className="sticky top-0 z-50 bg-black">
      <div className="max-w-6xl mx-auto px-5 md:px-8 flex items-center justify-between h-14 md:h-16">

        {/* Logo + links grouped on the left */}
        <div className="flex items-center" style={{ gap: '60px' }}>
          <Link href="/" className="text-lg font-semibold text-white tracking-tight">
            Convoy
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} className="nav-pill">{l.label}</Link>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">

          {/* ── Notifications bell ── */}
          <Link
            href="/notifications"
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-black">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>

          {/* ── Desktop: avatar dropdown ── */}
          <div ref={avatarRef} className="hidden md:block relative">
            <button
              onClick={() => setAvatarOpen(o => !o)}
              className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/20 hover:ring-white/50 transition-all shrink-0"
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
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0" /></svg>
                    Profile
                  </Link>
                  <Link href="/my-trips" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setAvatarOpen(false)}>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zM3.75 12h.007v.008H3.75V12zm0 5.25h.007v.008H3.75v-.008z" /></svg>
                    My trips
                  </Link>
                </div>
                <div className="py-1 border-t border-gray-100">
                  <button onClick={() => { setAvatarOpen(false); handleSignOut() }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Mobile: avatar (link) + hamburger ── */}
          <Link
            href="/profile"
            className="md:hidden w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/20 transition-all shrink-0"
          >
            {Avatar}
          </Link>

          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden p-1.5 text-white rounded-lg hover:bg-white/10 transition-colors"
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
          <div className="md:hidden absolute left-0 right-0 top-14 z-50 bg-black border-t border-white/10 px-4 pb-4 pt-2
                          animate-in slide-in-from-top-2 fade-in duration-200">
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} className="mobile-nav-link block" onClick={() => setMobileOpen(false)}>{l.label}</Link>
            ))}
            <Link href="/profile" className="mobile-nav-link block" onClick={() => setMobileOpen(false)}>Profile</Link>
            <div className="border-t border-white/10 mt-3 pt-3">
              <button
                onClick={() => { setMobileOpen(false); handleSignOut() }}
                className="block w-full text-left py-2.5 px-3 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 rounded-xl transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
