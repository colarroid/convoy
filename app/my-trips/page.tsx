'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import AppNav from '@/components/AppNav'
import CommunityLogo from '@/components/CommunityLogo'
import AddToCalendar from '@/components/AddToCalendar'
import { tripStart } from '@/lib/calendar'
import {
  getMyTrips, getMyJoinedTrips, completeTrip, cancelTrip, deleteTrip, forgetJoinedTrip, withdrawRequest, recordTripFeedback, formatTripDate, isPast, isPastBy, isReturn, pointLabel,
  type MyTripRow, type JoinedTripRow,
} from '@/lib/trips'

function StatusBadge({ status, past }: { status: string; past: boolean }) {
  const cfg =
    status === 'completed' ? { label: 'Completed', cls: 'bg-green-50 text-green-600' }
    : status === 'cancelled' ? { label: 'Cancelled', cls: 'bg-gray-100 text-gray-400' }
    : past ? { label: 'Awaiting confirmation', cls: 'bg-amber-50 text-amber-600' }
    : { label: 'Upcoming', cls: 'bg-blue-50 text-blue-600' }
  return <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span>
}

export default function MyTripsPage() {
  const [hosting, setHosting] = useState<MyTripRow[]>([])
  const [joined, setJoined] = useState<JoinedTripRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resolved, setResolved] = useState<Record<string, 'completed' | 'cancelled'>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [leftJoined, setLeftJoined] = useState<string[]>([])
  const [leaving, setLeaving] = useState<string | null>(null)
  const [deletedHosting, setDeletedHosting] = useState<string[]>([])
  const [removing, setRemoving] = useState<string | null>(null)
  const [feedbackFor, setFeedbackFor] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState('')

  useEffect(() => {
    Promise.all([getMyTrips(), getMyJoinedTrips()])
      .then(([h, j]) => { setHosting(h); setJoined(j) })
      .catch(e => { console.error(e); setError(e?.message ?? 'Could not load your trips.') })
      .finally(() => setLoading(false))
  }, [])

  const handleComplete = async (id: string, action: 'complete' | 'cancel') => {
    setBusy(id)
    try {
      if (action === 'complete') await completeTrip(id)
      else await cancelTrip(id)
      setResolved(prev => ({ ...prev, [id]: action === 'complete' ? 'completed' : 'cancelled' }))
    } catch { /* keep prompt for retry */ } finally { setBusy(null) }
  }

  // "Didn't happen" → record the optional note, then cancel the ride.
  const handleDidntHappen = async (id: string) => {
    setBusy(id)
    try {
      try { await recordTripFeedback(id, feedbackText) } catch { /* feedback is best-effort */ }
      await cancelTrip(id)
      setResolved(prev => ({ ...prev, [id]: 'cancelled' }))
      setFeedbackFor(null)
      setFeedbackText('')
    } catch { /* keep prompt for retry */ } finally { setBusy(null) }
  }

  const handleLeave = async (trip: JoinedTripRow) => {
    setLeaving(trip.trip_id)
    try {
      await withdrawRequest(trip.trip_id)   // notifies the host server-side
      setLeftJoined(prev => [...prev, trip.trip_id])
    } catch { /* keep card for retry */ } finally { setLeaving(null) }
  }

  // Host deletes one of their own cancelled trips.
  const handleDeleteHosting = async (id: string) => {
    setRemoving(id)
    try {
      await deleteTrip(id)
      setDeletedHosting(prev => [...prev, id])
    } catch { /* keep card for retry */ } finally { setRemoving(null) }
  }

  // Rider removes a cancelled joined trip from their own list.
  const handleForgetJoined = async (id: string) => {
    setRemoving(id)
    try {
      await forgetJoinedTrip(id)
      setLeftJoined(prev => [...prev, id])
    } catch { /* keep card for retry */ } finally { setRemoving(null) }
  }

  const statusOf = (t: MyTripRow): string => resolved[t.id] ?? t.status

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <AppNav />
        <main className="flex-1 w-full max-w-xl mx-auto px-5 md:px-8 pt-8">
          <div className="h-8 bg-gray-100 rounded w-40 mb-6 animate-pulse" />
          <div className="h-44 bg-gray-100 rounded-2xl animate-pulse" />
        </main>
      </div>
    )
  }

  // Guests can't confirm a ride, so it drops off their list 15 min after departure.
  // (Hosts keep theirs until they confirm or mark it didn't happen.)
  const visibleJoined = joined.filter(t => !leftJoined.includes(t.trip_id) && !isPastBy(t.departs_at, 15))

  // Hosting: hide deleted trips, and auto-hide cancelled trips once they're past departure.
  const visibleHosting = hosting.filter(t => !deletedHosting.includes(t.id) && !(statusOf(t) === 'cancelled' && isPast(t.departs_at)))

  const nothing = visibleHosting.length === 0 && visibleJoined.length === 0

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AppNav />

      <main className="flex-1 w-full max-w-xl mx-auto px-5 md:px-8 pt-8 pb-12">
        <div className="animate-fade-up">
          <h1 className="text-3xl font-bold text-black mb-1">My Trips</h1>
          <p className="text-sm text-gray-500 mb-5">Manage your posted trips and rides you&apos;ve joined.</p>
        </div>

        {/* Quick actions: start a new ride any time */}
        {!nothing && (
          <div className="flex gap-3 mb-7 animate-fade-up">
            <Link href="/offer/community" className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all">
              Offer a ride
            </Link>
            <Link href="/find/community" className="flex-1 inline-flex items-center justify-center gap-2 py-3 border border-black text-black rounded-xl text-sm font-semibold hover:bg-black hover:text-white active:scale-[0.98] transition-all">
              Find a ride
            </Link>
          </div>
        )}

        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : nothing ? (
          <div className="flex flex-col items-center text-center pt-12 animate-fade-up">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8.00004L19 10M19 10L17.5 6.30004C17.3585 5.92138 17.1057 5.59446 16.7747 5.36239C16.4437 5.13032 16.0502 5.00399 15.646 5.00004H8.4C7.9925 4.99068 7.59188 5.10605 7.25177 5.3307C6.91166 5.55536 6.64832 5.87856 6.497 6.25704L5 10M19 10H5M19 10C20.1046 10 21 10.8954 21 12V16C21 17.1046 20.1046 18 19 18M5 10L3 8.00004M5 10C3.89543 10 3 10.8954 3 12V16C3 17.1046 3.89543 18 5 18M7 14H7.01M17 14H17.01M19 18H5M19 18V20M5 18V20" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-black mb-2">No trips yet</h2>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-6">Offer a ride or join one and it&apos;ll show up here.</p>
            <div className="flex gap-3">
              <Link href="/offer/community" className="px-6 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all">
                Offer a ride
              </Link>
              <Link href="/find/community" className="px-6 py-3 border border-black text-black rounded-xl text-sm font-semibold hover:bg-black hover:text-white active:scale-[0.98] transition-all">
                Find a ride
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ── Offering ── */}
            {visibleHosting.length > 0 && (
              <>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3 px-1">Rides you&apos;re offering</p>
                <div className="flex flex-col gap-5 mb-9">
                  {visibleHosting.map((trip, i) => {
                    const status = statusOf(trip)
                    const past = isPast(trip.departs_at)
                    const needsConfirm = status === 'open' && past
                    return (
                      <div key={trip.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
                        <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <CommunityLogo src={trip.community_logo} name={trip.community_name} className="w-12 h-12" />
                            <div className="min-w-0">
                              <p className="text-base font-bold text-black leading-snug truncate">
                                {isReturn(trip.direction) ? `From ${trip.community_name}` : trip.community_name}
                              </p>
                              {trip.area && <p className="text-sm text-gray-400">{trip.area}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {isReturn(trip.direction) && (
                              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">Ride back</span>
                            )}
                            <StatusBadge status={status} past={past} />
                          </div>
                        </div>

                        <div className="px-4 py-3.5 border-t border-gray-100 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Date &amp; time</p>
                            <p className="text-sm font-bold text-black">{formatTripDate(trip.depart_date)} · {trip.depart_time}</p>
                          </div>
                          {status === 'open' && !past && (() => {
                            const start = tripStart(trip.departs_at, trip.depart_date, trip.depart_time)
                            return start ? (
                              <AddToCalendar uid={`${trip.id}@veesaa.co`} title={isReturn(trip.direction) ? `Ride back from ${trip.community_name}` : `Ride to ${trip.community_name}`}
                                location={trip.pickup_point} description={`You're driving. ${pointLabel(trip.direction)}: ${trip.pickup_point}`} start={start} />
                            ) : null
                          })()}
                        </div>
                        <div className="px-4 py-3.5 border-t border-gray-100">
                          <p className="text-xs text-gray-400 mb-0.5">{pointLabel(trip.direction)}</p>
                          <p className="text-sm font-bold text-black leading-snug">{trip.pickup_point}</p>
                          {trip.pickup_note && <p className="text-xs text-gray-400 mt-0.5">{trip.pickup_note}</p>}
                        </div>

                        {needsConfirm ? (
                          <div className="px-4 pb-4 pt-3 border-t border-gray-100">
                            {feedbackFor === trip.id ? (
                              <>
                                <p className="text-sm font-semibold text-black mb-1">What happened?</p>
                                <p className="text-xs text-gray-400 mb-2.5">Optional. A quick note helps us improve Veesaa.</p>
                                <textarea
                                  value={feedbackText}
                                  onChange={e => setFeedbackText(e.target.value)}
                                  rows={3}
                                  placeholder="e.g. No one showed up, plans changed, I had to cancel…"
                                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all resize-none mb-3"
                                />
                                <div className="flex gap-3">
                                  <button onClick={() => { setFeedbackFor(null); setFeedbackText('') }} disabled={busy === trip.id}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50">
                                    Back
                                  </button>
                                  <button onClick={() => handleDidntHappen(trip.id)} disabled={busy === trip.id}
                                    className="flex-[2] py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50">
                                    {busy === trip.id ? '…' : 'Cancel ride'}
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-sm font-semibold text-black mb-2.5">Did this trip happen?</p>
                                <div className="flex gap-3">
                                  <button onClick={() => { setFeedbackFor(trip.id); setFeedbackText('') }} disabled={busy === trip.id}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50">
                                    Didn&apos;t happen
                                  </button>
                                  <button onClick={() => handleComplete(trip.id, 'complete')} disabled={busy === trip.id}
                                    className="flex-[2] py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50">
                                    {busy === trip.id ? '…' : 'Yes, it happened'}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="px-4 pb-4 pt-3 flex gap-3">
                            <Link href={`/my-trips/${trip.id}`} className="flex-1 text-center py-3 bg-gray-100 text-black rounded-xl text-sm font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all">
                              Trip details
                            </Link>
                            {status === 'open' && (
                              <Link href={`/my-trips/${trip.id}/requests`} className="flex-1 relative text-center py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all">
                                Requests
                                {trip.pending_count > 0 && (
                                  <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">{trip.pending_count}</span>
                                )}
                              </Link>
                            )}
                            {status === 'cancelled' && (
                              <button
                                onClick={() => handleDeleteHosting(trip.id)}
                                disabled={removing === trip.id}
                                className="flex-1 py-3 rounded-xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 active:scale-[0.98] transition-all disabled:opacity-50"
                              >
                                {removing === trip.id ? 'Deleting…' : 'Delete'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* ── Joining ── */}
            {visibleJoined.length > 0 && (
              <>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3 px-1">Rides you&apos;re joining</p>
                <div className="flex flex-col gap-5">
                  {visibleJoined.map((trip, i) => {
                    const past = isPast(trip.departs_at)
                    return (
                      <div key={trip.trip_id} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
                        <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-base font-bold text-gray-600 shrink-0">
                              {trip.host_photo ? <img src={trip.host_photo} alt="" className="w-full h-full object-cover" /> : (trip.host_name?.[0] ?? '?')}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-black truncate">{trip.host_name ?? 'Member'}</p>
                              <p className="text-xs text-gray-400">
                                {isReturn(trip.direction) ? `From ${trip.community_name}` : trip.community_name}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={trip.status} past={past} />
                        </div>

                        <div className="px-4 py-3.5 border-t border-gray-100 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Date &amp; time</p>
                            <p className="text-sm font-bold text-black">{formatTripDate(trip.depart_date)} · {trip.depart_time}</p>
                          </div>
                          {trip.status === 'open' && !past && (() => {
                            const start = tripStart(trip.departs_at, trip.depart_date, trip.depart_time)
                            return start ? (
                              <AddToCalendar uid={`${trip.trip_id}@veesaa.co`} title={isReturn(trip.direction) ? `Ride back from ${trip.community_name}` : `Ride to ${trip.community_name}`}
                                location={trip.pickup_point} description={`Host: ${trip.host_name ?? 'Member'}. ${pointLabel(trip.direction)}: ${trip.pickup_point}`} start={start} />
                            ) : null
                          })()}
                        </div>
                        <div className="px-4 py-3.5 border-t border-gray-100">
                          <p className="text-xs text-gray-400 mb-0.5">{pointLabel(trip.direction)}</p>
                          <p className="text-sm font-bold text-black leading-snug">{trip.pickup_point}</p>
                          {trip.pickup_note && <p className="text-xs text-gray-400 mt-0.5">{trip.pickup_note}</p>}
                        </div>
                        {trip.vehicle && (
                          <div className="px-4 py-3.5 border-t border-gray-100">
                            <p className="text-xs text-gray-400 mb-1.5">Ride details</p>
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full border border-gray-200 shrink-0" style={{ backgroundColor: trip.color_hex ?? '#9CA3AF' }} />
                              <p className="text-sm font-bold text-black">{trip.vehicle}</p>
                            </div>
                          </div>
                        )}

                        {trip.status === 'open' && (
                          <div className="px-4 pb-4 pt-3 border-t border-gray-100 flex gap-3">
                            {trip.host_phone && (
                              <a
                                href={`tel:${trip.host_phone.replace(/[^\d+]/g, '')}`}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                </svg>
                                Call host
                              </a>
                            )}
                            <button
                              onClick={() => handleLeave(trip)}
                              disabled={leaving === trip.trip_id}
                              className={`${trip.host_phone ? 'flex-1' : 'w-full'} py-3 rounded-xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 active:scale-[0.98] transition-all disabled:opacity-50`}
                            >
                              {leaving === trip.trip_id ? 'Leaving…' : 'Leave ride'}
                            </button>
                          </div>
                        )}

                        {trip.status === 'cancelled' && (
                          <div className="px-4 pb-4 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => handleForgetJoined(trip.trip_id)}
                              disabled={removing === trip.trip_id}
                              className="w-full py-3 rounded-xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                              {removing === trip.trip_id ? 'Removing…' : 'Remove'}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
