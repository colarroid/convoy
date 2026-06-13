'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AppNav from '@/components/AppNav'
import HopeNationBadge from '@/components/HopeNationBadge'
import { getTripDetail, getTripRequests, resolveRequest, ridesLabel, type MyTripRow, type RequestRow } from '@/lib/trips'
import ReportModal from '@/components/ReportModal'

export default function JoinRequestsPage() {
  const router = useRouter()
  const params = useParams()
  const tripId = params.id as string

  const [trip, setTrip] = useState<MyTripRow | null>(null)
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [resolved, setResolved] = useState<Record<string, 'approved' | 'declined'>>({})
  const [removed, setRemoved] = useState<string[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const [reportTarget, setReportTarget] = useState<{ id: string; name?: string } | null>(null)

  useEffect(() => {
    Promise.all([getTripDetail(tripId), getTripRequests(tripId, 'pending')])
      .then(([t, r]) => { setTrip(t); setRequests(r) })
      .catch(() => setTrip(null))
      .finally(() => setLoading(false))
  }, [tripId])

  const resolve = async (req: RequestRow, action: 'approved' | 'declined') => {
    setBusy(req.request_id)
    setActionError('')
    try {
      await resolveRequest(req.request_id, action)   // notifies the rider server-side
      setResolved(prev => ({ ...prev, [req.request_id]: action }))
      setTimeout(() => setRemoved(prev => [...prev, req.request_id]), 320)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not update the request.')
    } finally {
      setBusy(null)
    }
  }

  const visible = requests.filter(r => !removed.includes(r.request_id))

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AppNav />

      <main className="flex-1 w-full max-w-xl mx-auto px-5 md:px-8 pt-8 pb-12">
        <h1 className="text-3xl font-bold text-black mb-7 animate-fade-up">Join request</h1>

        {actionError && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 animate-fade-up">
            {actionError}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 animate-pulse h-32" />
        ) : !trip ? (
          <>
            <p className="text-sm text-gray-400">This trip could not be found.</p>
            <button onClick={() => router.push('/my-trips')} className="mt-4 text-sm font-semibold text-black underline">Back to my trips</button>
          </>
        ) : (
          <>
            {/* Trip summary card */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 animate-fade-up" style={{ animationDelay: '80ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <HopeNationBadge className="w-12 h-12" />
                <div className="min-w-0">
                  <p className="text-base font-bold text-black leading-snug truncate">{trip.community_name}</p>
                  {trip.area && <p className="text-sm text-gray-400">{trip.area}</p>}
                </div>
              </div>
              <Link href={`/my-trips/${trip.id}`} className="w-full block text-center py-3 bg-gray-100 text-black rounded-xl text-sm font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all">
                View trip
              </Link>
            </div>

            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mt-8 mb-3 animate-fade-up" style={{ animationDelay: '140ms' }}>
              Pending requests
            </p>

            {visible.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-6 py-10 text-center animate-fade-up">
                <svg className="w-9 h-9 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <p className="text-sm text-gray-500">You&apos;re all caught up. No pending requests.</p>
                <Link href={`/my-trips/${trip.id}`} className="inline-block mt-4 text-sm font-semibold text-black underline">Back to trip</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {visible.map((req, i) => {
                  const state = resolved[req.request_id]
                  return (
                    <div
                      key={req.request_id}
                      className={`rounded-2xl border border-gray-200 bg-white shadow-sm p-4 ${state ? 'animate-collapse' : 'animate-fade-up'}`}
                      style={state ? undefined : { animationDelay: `${180 + i * 80}ms` }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-base font-bold text-gray-600 shrink-0">
                          {req.rider_photo ? <img src={req.rider_photo} alt="" className="w-full h-full object-cover" /> : (req.rider_name?.[0] ?? '?')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-black truncate">{req.rider_name ?? 'Member'}</p>
                          <p className="text-xs text-gray-400">{ridesLabel(req.rider_rides)}</p>
                        </div>
                        {!state && (
                          <button
                            onClick={() => setReportTarget({ id: req.rider_id, name: req.rider_name ?? undefined })}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors shrink-0"
                          >
                            Report
                          </button>
                        )}
                      </div>

                      {state ? (
                        <div className={`text-center py-3 rounded-xl text-sm font-semibold ${state === 'approved' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {state === 'approved' ? 'Approved ✓' : 'Declined'}
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={() => resolve(req, 'declined')}
                            disabled={busy === req.request_id}
                            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => resolve(req, 'approved')}
                            disabled={busy === req.request_id}
                            className="flex-1 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            {busy === req.request_id ? '…' : 'Approve'}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>

      <ReportModal
        open={!!reportTarget}
        onClose={() => setReportTarget(null)}
        reportedUserId={reportTarget?.id}
        reportedName={reportTarget?.name}
        tripId={tripId}
      />
    </div>
  )
}
