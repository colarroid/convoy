'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import FindFlowShell from '@/components/FindFlowShell'
import { getFindDraft } from '@/lib/findStore'
import { useSuspended } from '@/lib/useSuspended'
import { getCommunityTrips, requestToJoin, withdrawRequest, formatTripDate, ridesLabel, type RideRow } from '@/lib/trips'
import ReportModal from '@/components/ReportModal'

export default function RideDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const draft = getFindDraft()

  const [ride, setRide] = useState<RideRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState('')
  const [showReport, setShowReport] = useState(false)
  const { suspended } = useSuspended()

  useEffect(() => {
    if (!draft.communityCode) { setLoading(false); return }
    getCommunityTrips(draft.communityCode)
      .then(rides => setRide(rides.find(r => r.id === id) ?? null))
      .catch(() => setRide(null))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleWithdraw = async () => {
    if (!ride) return
    setRequesting(true)
    setError('')
    try {
      await withdrawRequest(ride.id)
      setRide({ ...ride, already_requested: false })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not cancel your request.')
    } finally {
      setRequesting(false)
    }
  }

  const handleRequest = async () => {
    if (!ride || !draft.communityCode) return
    setRequesting(true)
    setError('')
    try {
      await requestToJoin(draft.communityCode, ride.id)   // notifies the host server-side
      const hostFirst = ride.host_name?.split(' ')[0] ?? 'The host'
      router.push(`/find/requested?host=${encodeURIComponent(hostFirst)}`)
    } catch (e) {
      setRequesting(false)
      setError(e instanceof Error ? e.message : 'Could not send your request.')
    }
  }

  if (loading) {
    return (
      <FindFlowShell context="Trip details" communityName={draft.communityName} footer={
        <button onClick={() => router.back()} className="w-full py-3.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700">Back</button>
      }>
        <div className="h-56 bg-gray-100 rounded-2xl animate-pulse" />
      </FindFlowShell>
    )
  }

  if (!ride) {
    return (
      <FindFlowShell context="Trip details" title="Ride not available" communityName={draft.communityName} footer={
        <button onClick={() => router.back()} className="w-full py-3.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700">Back</button>
      }>
        <p className="text-sm text-gray-400">This ride may have been filled or removed.</p>
      </FindFlowShell>
    )
  }

  const vehicleLabel = [ride.color, ride.vehicle].filter(Boolean).join(' ') || ride.vehicle || '-'
  const alreadyRequested = ride.already_requested

  return (
    <FindFlowShell
      context="Trip details"
      title={ride.community_name}
      subtitle={ride.area ?? undefined}
      communityName={draft.communityName}
      footer={
        <div>
          {error && <p className="text-sm text-red-500 text-center mb-3">{error}</p>}
          <div className="flex gap-3">
            <button onClick={() => router.back()} className="flex-1 py-3.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
              Back
            </button>
            {alreadyRequested ? (
              <button
                onClick={handleWithdraw}
                disabled={requesting}
                className="flex-[2] py-3.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {requesting ? 'Cancelling…' : 'Cancel request'}
              </button>
            ) : suspended ? (
              <span
                className="flex-[2] py-3.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-400 text-center cursor-not-allowed"
                title="Your account is suspended"
              >
                Account suspended
              </span>
            ) : (
              <button
                onClick={handleRequest}
                disabled={requesting}
                className="flex-[2] py-3.5 rounded-xl text-sm font-medium bg-black text-white hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {requesting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending…
                  </span>
                ) : 'Request to join'}
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-100">
          <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-base font-bold text-gray-600 shrink-0 overflow-hidden">
            {ride.host_photo ? <img src={ride.host_photo} alt="" className="w-full h-full object-cover" /> : (ride.host_name?.[0] ?? '?')}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-black truncate">{ride.host_name ?? 'Member'}</p>
            <p className="text-xs text-gray-400">{ridesLabel(ride.host_rides)}</p>
          </div>
        </div>

        <div className="px-4 py-3.5 border-b border-gray-100">
          <p className="text-xs text-gray-400 mb-0.5">Date &amp; time</p>
          <p className="text-sm font-bold text-black">{formatTripDate(ride.depart_date)} · {ride.depart_time}</p>
        </div>

        <div className="px-4 py-3.5 border-b border-gray-100">
          <p className="text-xs text-gray-400 mb-0.5">Pickup point</p>
          <p className="text-sm font-bold text-black leading-snug">{ride.pickup_point}</p>
          {ride.pickup_note && <p className="text-xs text-gray-400 mt-0.5">{ride.pickup_note}</p>}
        </div>

        <div className="px-4 py-3.5 border-b border-gray-100">
          <p className="text-xs text-gray-400 mb-1.5">Ride details</p>
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full border border-gray-200 shrink-0" style={{ backgroundColor: ride.color_hex ?? '#9CA3AF' }} />
            <p className="text-sm font-bold text-black">{vehicleLabel}</p>
          </div>
        </div>

        <div className="px-4 py-3.5">
          <p className="text-xs text-gray-400 mb-0.5">Seats</p>
          <p className="text-sm font-bold text-black">{ride.seats_open} of {ride.seats_total} open</p>
        </div>
      </div>

      <div className="flex items-start gap-2.5 mt-5 px-1">
        <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <p className="text-xs text-gray-500 leading-relaxed">
          The host&apos;s home address is never shared. You&apos;ll only ever see the pickup point above.
        </p>
      </div>

      <button
        onClick={() => setShowReport(true)}
        className="mt-4 mx-auto block text-xs text-gray-400 hover:text-red-500 transition-colors underline underline-offset-2"
      >
        Report this ride
      </button>

      <ReportModal
        open={showReport}
        onClose={() => setShowReport(false)}
        reportedUserId={ride.host_id}
        reportedName={ride.host_name ?? undefined}
        tripId={ride.id}
      />
    </FindFlowShell>
  )
}
