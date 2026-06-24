'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import AppNav from '@/components/AppNav'
import PhoneField from '@/components/PhoneField'
import { COUNTRY_CODES, parsePhone, type Country } from '@/lib/countries'
import { useRouter } from 'next/navigation'
import { getUser, saveUser, savePhoto, getInitials, type ConvoyUser } from '@/lib/userStore'
import { supabase } from '@/lib/supabase'
import { uploadProfilePhoto } from '@/lib/cloudinary'
import { signOut } from '@/lib/auth'
import { getRideHistory, getRidesCompleted, formatTripDate, ridesLabel, isPast, isPastBy, type RideHistoryRow } from '@/lib/trips'
import ShareExperience from '@/components/ShareExperience'
import { getMyExperience } from '@/lib/experiences'
import { getMySettings, updateMySetting, DEFAULT_SETTINGS, type Settings } from '@/lib/settings'

/* ── Toggle switch ── */
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? 'bg-black' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
    </button>
  )
}

/* ── Settings row ── */
function Row({ icon, label, value, href, onClick, danger, trailing }: {
  icon: React.ReactNode
  label: string
  value?: string
  href?: string
  onClick?: () => void
  danger?: boolean
  trailing?: React.ReactNode
}) {
  const inner = (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${danger ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
        {icon}
      </div>
      <span className={`text-sm font-medium flex-1 ${danger ? 'text-red-500' : 'text-black'}`}>{label}</span>
      {value && <span className="text-sm text-gray-400 truncate max-w-[40%]">{value}</span>}
      {trailing ?? (
        (href || onClick) && !danger ? (
          <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        ) : null
      )}
    </div>
  )

  if (href) return <Link href={href} className="block hover:bg-gray-50 transition-colors">{inner}</Link>
  if (onClick) return <button type="button" onClick={onClick} className="w-full text-left hover:bg-gray-50 transition-colors">{inner}</button>
  return inner
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2 px-1">{title}</p>
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
        {children}
      </div>
    </div>
  )
}

const PW_REQS = [
  { label: 'At least 8 characters', met: (p: string) => p.length >= 8 },
  { label: 'At least 1 number', met: (p: string) => /[0-9]/.test(p) },
  { label: '1 lowercase and 1 uppercase letter', met: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
]

/* ── Password field with show/hide ── */
function PwField({ value, onChange, placeholder, autoFocus }: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  autoFocus?: boolean
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        className="input-field pr-11"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        )}
      </button>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<ConvoyUser | null>(null)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '' })
  const [country, setCountry] = useState<Country>(COUNTRY_CODES[0])
  const [localPhone, setLocalPhone] = useState('')
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Change-password modal
  const [pwOpen, setPwOpen] = useState(false)
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)

  const closePwModal = () => {
    setPwOpen(false)
    setPw({ current: '', next: '', confirm: '' })
    setPwError('')
  }

  const submitPassword = async () => {
    if (!pw.current) { setPwError('Enter your current password.'); return }
    if (!PW_REQS.every(r => r.met(pw.next))) { setPwError('Your new password doesn’t meet the requirements.'); return }
    if (pw.next !== pw.confirm) { setPwError('New passwords don’t match.'); return }
    if (pw.next === pw.current) { setPwError('New password must be different from the current one.'); return }
    setPwError('')
    setPwSaving(true)
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      const email = authUser?.email
      if (!email) { setPwSaving(false); setPwError('Could not verify your account. Please sign in again.'); return }

      // Verify the current password by re-authenticating.
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: pw.current })
      if (signInErr) { setPwSaving(false); setPwError('Your current password is incorrect.'); return }

      // Set the new password.
      const { error: updErr } = await supabase.auth.updateUser({ password: pw.next })
      if (updErr) { setPwSaving(false); setPwError(updErr.message); return }

      // Security alert through the usual pipeline (bell + push + email).
      // Best-effort: never let a notification hiccup undo the password change.
      try {
        await supabase.rpc('notify_self', {
          p_title: 'Password changed',
          p_body: 'Your Veesaa password was just changed. If this wasn’t you, reset it immediately and contact support@veesaa.co.',
          p_url: '/profile',
        })
      } catch { /* non-blocking */ }

      setPwSaving(false)
      closePwModal()
      setPwSaved(true)
      setTimeout(() => setPwSaved(false), 2500)
    } catch (e) {
      setPwSaving(false)
      setPwError(e instanceof Error ? e.message : 'Could not change your password. Please try again.')
    }
  }

  const [ridesCompleted, setRidesCompleted] = useState(0)
  const [history, setHistory] = useState<RideHistoryRow[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [myExp, setMyExp] = useState<string | null>(null)
  const [expLoaded, setExpLoaded] = useState(false)

  const seedForm = (u: ConvoyUser) => {
    setForm({ firstName: u.firstName, lastName: u.lastName })
    const { country: c, local } = parsePhone(u.phone)
    setCountry(c)
    setLocalPhone(local)
  }

  useEffect(() => {
    const u = getUser()
    setUser(u)
    getMySettings().then(setSettings).catch(() => {})
    if (u) seedForm(u)

    getRidesCompleted().then(setRidesCompleted).catch(() => {})
    getRideHistory()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setHistoryLoading(false))
    getMyExperience()
      .then((e) => setMyExp(e?.body ?? null))
      .catch(() => {})
      .finally(() => setExpLoaded(true))
  }, [])

  const updateSetting = (key: keyof Settings, value: boolean) => {
    const prev = settings
    setSettings({ ...settings, [key]: value })   // optimistic
    updateMySetting(key, value).catch(() => setSettings(prev))   // revert on failure
  }

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !file.type.startsWith('image/')) return

    setPhotoUploading(true)
    try {
      const url = await uploadProfilePhoto(file)
      savePhoto(url)
      setUser(getUser())
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) await supabase.from('profiles').update({ photo_url: url }).eq('id', authUser.id)
    } catch {
      // keep the old photo on failure
    } finally {
      setPhotoUploading(false)
    }
  }

  const handleSave = () => {
    if (!user) return
    const updated: ConvoyUser = {
      ...user,
      firstName: form.firstName.trim() || user.firstName,
      lastName: form.lastName.trim() || user.lastName,
      phone: localPhone ? `${country.dial}${localPhone}` : '',
    }
    saveUser(updated)
    setUser(updated)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const initials = getInitials(user)
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Your account'

  // A joined ride the host marked as "didn't happen" (cancelled) drops off the
  // guest's history; everything else stays as a record.
  const visibleHistory = history.filter(r => !(r.role === 'joined' && r.status === 'cancelled'))

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppNav />

      <main className="flex-1 w-full max-w-xl mx-auto px-5 md:px-8 pt-6 pb-12">

        {/* ── Profile header ── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 mb-7 animate-fade-up">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center text-white text-2xl font-bold ring-2 ring-gray-100 relative">
                {user?.photoDataUrl
                  ? <img src={user.photoDataUrl} alt="avatar" className="w-full h-full object-cover" />
                  : initials}
                {photoUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <svg className="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-black text-white flex items-center justify-center ring-2 ring-white hover:bg-gray-800 transition-colors"
                aria-label="Change photo"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>

            {/* Name / email */}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-black truncate">{fullName}</h1>
              <p className="text-sm text-gray-400 truncate">{user?.email ?? '-'}</p>
              <div className="inline-flex items-center gap-1.5 mt-2 bg-gray-100 rounded-full px-2.5 py-1">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium text-gray-600">{ridesLabel(ridesCompleted)}</span>
              </div>
            </div>
          </div>

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="mt-5 w-full py-2.5 rounded-xl bg-gray-100 text-black text-sm font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all"
            >
              Edit profile
            </button>
          ) : (
            <div className="mt-5 flex flex-col gap-3 animate-fade-up">
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  placeholder="First name"
                  className="input-field"
                />
                <input
                  value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                  placeholder="Last name"
                  className="input-field"
                />
              </div>

              {/* Email, not editable */}
              <div className="relative">
                <input
                  value={user?.email ?? ''}
                  readOnly
                  disabled
                  className="input-field pr-10 bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>

              {/* Phone, consistent with signup */}
              <PhoneField
                country={country}
                localPhone={localPhone}
                onCountryChange={(c) => { setCountry(c); setLocalPhone('') }}
                onLocalChange={setLocalPhone}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => { setEditing(false); if (user) seedForm(user) }}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-[2] py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all"
                >
                  Save changes
                </button>
              </div>
            </div>
          )}

          {saved && (
            <p className="mt-3 text-xs text-green-600 font-medium text-center animate-fade-up">Profile updated ✓</p>
          )}
        </div>

        {/* ── Share your experience (form shows only until they share) ── */}
        {expLoaded && myExp === null && <ShareExperience onSaved={setMyExp} />}

        {/* ── Ride history ── */}
        <div className="mb-7">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Ride history</p>
            {!historyLoading && visibleHistory.length > 0 && (
              <span className="text-xs text-gray-400">{visibleHistory.length} {visibleHistory.length === 1 ? 'trip' : 'trips'}</span>
            )}
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
            {historyLoading ? (
              <div className="px-4 py-4 space-y-3 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ) : visibleHistory.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-gray-400">No rides yet. Offer or join a ride and it&apos;ll show up here.</p>
              </div>
            ) : (
              visibleHistory.map((ride, i) => {
                // Past + still open = the host hasn't reviewed it yet. It flips to
                // Completed when the host confirms (or drops off if marked cancelled).
                const past = ride.role === 'joined' ? isPastBy(ride.departs_at, 15) : isPast(ride.departs_at)
                const statusLabel =
                  ride.status === 'completed' ? 'Completed'
                  : ride.status === 'cancelled' ? 'Cancelled'
                  : past ? 'Awaiting confirmation'
                  : 'Upcoming'
                const statusClass =
                  ride.status === 'completed' ? 'bg-green-50 text-green-600'
                  : ride.status === 'cancelled' ? 'bg-gray-100 text-gray-400'
                  : past ? 'bg-amber-50 text-amber-600'
                  : 'bg-blue-50 text-blue-600'
                return (
                  <div
                    key={`${ride.role}-${ride.trip_id}`}
                    className="flex items-center gap-3 px-4 py-3.5 animate-fade-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${ride.role === 'offered' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {ride.role === 'offered' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-black truncate">{ride.destination}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {ride.role === 'offered' ? 'You offered' : `Rode with ${ride.counterpart ?? 'host'}`} · {formatTripDate(ride.depart_date)}
                      </p>
                    </div>

                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-full shrink-0 ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── Your experience (locked once shared) ── */}
        {myExp !== null && (
          <div className="mb-7">
            <p className="mb-2 px-1 text-xs font-bold uppercase tracking-widest text-gray-400">Your experience</p>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">&ldquo;{myExp}&rdquo;</p>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 0h10.5a2.25 2.25 0 012.25 2.25v6.75a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-6.75a2.25 2.25 0 012.25-2.25z" />
                </svg>
                Locked for now. You&apos;ll be able to edit this in future.
              </p>
            </div>
          </div>
        )}

        {/* ── Account ── */}
        <Section title="Account">
          <Row
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>}
            label="Phone number"
            value={user?.phone || 'Add number'}
            onClick={() => setEditing(true)}
          />
          <Row
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>}
            label="Change password"
            onClick={() => setPwOpen(true)}
          />
        </Section>

        {/* ── Preferences ── */}
        <Section title="Preferences">
          <Row
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>}
            label="Push notifications"
            trailing={<Toggle on={settings.pushNotifications} onChange={v => updateSetting('pushNotifications', v)} />}
          />
          <Row
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>}
            label="Email updates"
            trailing={<Toggle on={settings.emailUpdates} onChange={v => updateSetting('emailUpdates', v)} />}
          />
          <Row
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Ride reminders"
            trailing={<Toggle on={settings.rideReminders} onChange={v => updateSetting('rideReminders', v)} />}
          />
        </Section>

        {/* ── Support ── */}
        <Section title="Support & legal">
          <Row
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>}
            label="Help centre"
            href="/help"
          />
          <Row
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
            label="Terms of Use"
            href="/terms-of-use"
          />
          <Row
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>}
            label="Privacy Policy"
            href="/privacy"
          />
        </Section>

        {/* ── Sign out ── */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <Row
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>}
            label="Sign out"
            onClick={async () => { await signOut(); router.push('/login') }}
            danger
          />
        </div>

        <p className="text-xs text-gray-400 text-center mt-8">Veesaa · v0.1.0</p>
      </main>

      {/* ── Change password modal ── */}
      {pwOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={closePwModal} />

          {/* Panel */}
          <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 pb-7 sm:pb-5 shadow-xl animate-slide-up">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-black">Change password</h2>
              <button onClick={closePwModal} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors" aria-label="Close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-5">Confirm your current password, then set a new one.</p>

            <div className="flex flex-col gap-3">
              <PwField value={pw.current} onChange={v => { setPw(p => ({ ...p, current: v })); setPwError('') }} placeholder="Current password" autoFocus />

              <PwField value={pw.next} onChange={v => { setPw(p => ({ ...p, next: v })); setPwError('') }} placeholder="New password" />

              {/* Requirements */}
              {pw.next.length > 0 && (
                <ul className="flex flex-col gap-1.5 px-1 -mt-1">
                  {PW_REQS.map(req => {
                    const met = req.met(pw.next)
                    return (
                      <li key={req.label} className="flex items-center gap-2">
                        <svg className={`w-3.5 h-3.5 shrink-0 transition-colors ${met ? 'text-green-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className={`text-xs transition-colors ${met ? 'text-green-600 font-medium' : 'text-gray-400'}`}>{req.label}</span>
                      </li>
                    )
                  })}
                </ul>
              )}

              <PwField value={pw.confirm} onChange={v => { setPw(p => ({ ...p, confirm: v })); setPwError('') }} placeholder="Confirm new password" />

              {pwError && <p className="text-xs text-red-500 px-1">{pwError}</p>}

              <div className="flex gap-3 mt-2">
                <button onClick={closePwModal} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-all">
                  Cancel
                </button>
                <button
                  onClick={submitPassword}
                  disabled={pwSaving}
                  className="flex-[2] py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {pwSaving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Updating…
                    </>
                  ) : 'Update password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {pwSaved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-black text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-slide-up">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          Password updated
        </div>
      )}
    </div>
  )
}
