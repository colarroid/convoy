'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AppNav from '@/components/AppNav'
import { getTripDetail, getTripRequests, cancelTrip, formatTripDate, ridesLabel, isPast, type MyTripRow, type RequestRow } from '@/lib/trips'

export default function MyTripDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [trip, setTrip] = useState<MyTripRow | null>(null)
  const [approved, setApproved] = useState<RequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  useEffect(() => {
    Promise.all([getTripDetail(id), getTripRequests(id, 'approved')])
      .then(([t, a]) => { setTrip(t); setApproved(a) })
      .catch(() => setTrip(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!trip) return
    setCancelling(true)
    try {
      await cancelTrip(trip.id)   // notifies approved riders server-side
      router.push('/my-trips')
    } catch {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <AppNav />
        <main className="flex-1 w-full max-w-xl mx-auto px-5 md:px-8 pt-10">
          <div className="h-8 bg-gray-100 rounded w-2/3 mb-6 animate-pulse" />
          <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
        </main>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <AppNav />
        <main className="flex-1 w-full max-w-xl mx-auto px-5 md:px-8 pt-10">
          <p className="text-sm text-gray-400">This trip could not be found.</p>
          <button onClick={() => router.push('/my-trips')} className="mt-4 text-sm font-semibold text-black underline">Back to my trips</button>
        </main>
      </div>
    )
  }

  const pending = trip.pending_count

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AppNav />

      <main className="flex-1 w-full max-w-xl mx-auto px-5 md:px-8 pt-8 pb-12">
        <div className="animate-fade-up">
          <p className="text-sm text-gray-400 mb-1">Trip details</p>
          <h1 className="text-3xl font-bold text-black leading-tight mb-1">{trip.community_name}</h1>
          {trip.area && <p className="text-sm text-gray-400 mb-7">{trip.area}</p>}
        </div>

        {/* Trip card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden animate-fade-up" style={{ animationDelay: '90ms' }}>
          <div className="px-4 py-3.5">
            <p className="text-xs text-gray-400 mb-0.5">Date &amp; time</p>
            <p className="text-sm font-bold text-black">{formatTripDate(trip.depart_date)} · {trip.depart_time}</p>
          </div>
          <div className="px-4 py-3.5 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-0.5">Pickup point</p>
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
          <div className="px-4 py-3.5 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-0.5">Seats</p>
            <p className="text-sm font-bold text-black">{trip.seats_open} of {trip.seats_total} open</p>
          </div>
        </div>

        {/* Approved guests */}
        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mt-8 mb-3 animate-fade-up" style={{ animationDelay: '160ms' }}>
          Approved guests
        </p>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm animate-fade-up" style={{ animationDelay: '200ms' }}>
          {approved.length === 0 ? (
            <div className="flex flex-col items-center text-center px-6 py-8">
              <svg className="w-9 h-9 text-gray-300 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                {pending > 0 ? (
                  <>No approved guests yet. Review your{' '}
                    <Link href={`/my-trips/${trip.id}/requests`} className="font-semibold text-black underline">
                      {pending} pending request{pending !== 1 ? 's' : ''}
                    </Link>.
                  </>
                ) : (
                  <>No approved guests yet. Requests will appear here.</>
                )}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {approved.map(g => (
                <div key={g.request_id} className="px-4 py-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                    {g.rider_photo ? <img src={g.rider_photo} alt="" className="w-full h-full object-cover" /> : (g.rider_name?.[0] ?? '?')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-black truncate">{g.rider_name ?? 'Member'}</p>
                    <p className="text-xs text-gray-400">{ridesLabel(g.rider_rides)}</p>
                  </div>
                  {g.rider_phone && (
                    <a
                      href={`tel:${g.rider_phone.replace(/[^\d+]/g, '')}`}
                      className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 active:scale-95 transition-all shrink-0"
                      aria-label={`Call ${g.rider_name ?? 'guest'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {pending > 0 && (
          <Link
            href={`/my-trips/${trip.id}/requests`}
            className="mt-6 w-full block text-center py-3.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all animate-fade-up"
            style={{ animationDelay: '260ms' }}
          >
            Review {pending} request{pending !== 1 ? 's' : ''}
          </Link>
        )}

        {/* Cancel an upcoming, still-open ride */}
        {trip.status === 'open' && !isPast(trip.departs_at) && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            {!confirmCancel ? (
              <button
                onClick={() => setConfirmCancel(true)}
                className="w-full py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                Cancel this ride
              </button>
            ) : (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700 font-medium mb-1">Cancel this ride?</p>
                <p className="text-xs text-red-500 mb-3">
                  {approved.length > 0
                    ? `${approved.length} approved guest${approved.length !== 1 ? 's' : ''} will be notified. This can’t be undone.`
                    : 'This can’t be undone.'}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmCancel(false)} disabled={cancelling} className="flex-1 py-2.5 rounded-xl bg-white text-gray-700 text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50">
                    Keep ride
                  </button>
                  <button onClick={handleCancel} disabled={cancelling} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-60">
                    {cancelling ? 'Cancelling…' : 'Cancel ride'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
