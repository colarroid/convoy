'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FindFlowShell from '@/components/FindFlowShell'
import { getFindDraft } from '@/lib/findStore'
import { getCommunityTrips, formatTripDate, ridesLabel, pointLabel, type RideRow } from '@/lib/trips'
import { recordRideWant, setRideWantNotify } from '@/lib/rideWants'

// Rides at/under this distance are grouped under "Near you".
const NEAR_KM = 3

function HostAvatar({ name, photo }: { name: string | null; photo: string | null }) {
  return (
    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0 overflow-hidden">
      {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : (name?.[0] ?? '?')}
    </div>
  )
}

function RideCard({ ride, onSelect }: { ride: RideRow; onSelect: () => void }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3 flex items-center gap-3 border-b border-gray-100">
        <HostAvatar name={ride.host_name} photo={ride.host_photo} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-black truncate">{ride.host_name ?? 'Member'}</p>
          <p className="text-xs text-gray-400">{ridesLabel(ride.host_rides)}</p>
        </div>
        {ride.distance_km != null && (
          <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-600 shrink-0">
            ~{ride.distance_km} km away
          </span>
        )}
      </div>

      <div className="px-4 py-3.5 border-b border-gray-100">
        <p className="text-xs text-gray-400 mb-0.5">Date &amp; time</p>
        <p className="text-sm font-bold text-black">{formatTripDate(ride.depart_date)} · {ride.depart_time}</p>
      </div>

      <div className="px-4 py-3.5">
        <p className="text-xs text-gray-400 mb-0.5">{pointLabel(ride.direction)}</p>
        <p className="text-sm font-bold text-black leading-snug">{ride.pickup_point}</p>
        {ride.pickup_note && <p className="text-xs text-gray-400 mt-0.5">{ride.pickup_note}</p>}
      </div>

      <div className="px-4 pb-4">
        <button
          onClick={onSelect}
          className="w-full py-3 bg-gray-100 text-black rounded-xl text-sm font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all"
        >
          {ride.already_requested ? 'View (requested)' : 'Trip details'}
        </button>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="flex-1"><div className="h-3.5 bg-gray-200 rounded w-32 mb-1.5" /><div className="h-3 bg-gray-100 rounded w-20" /></div>
      </div>
      <div className="space-y-3"><div className="h-3 bg-gray-100 rounded w-2/3" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>
      <div className="mt-4 h-10 bg-gray-100 rounded-xl" />
    </div>
  )
}

export default function FindResultsPage() {
  const router = useRouter()
  const draft = getFindDraft()
  const direction = draft.direction ?? 'to_community'
  const returning = direction === 'from_community'
  const [rides, setRides] = useState<RideRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notified, setNotified] = useState(false)
  const [wantId, setWantId] = useState<string | null>(null)

  useEffect(() => {
    if (!draft.communityCode) { setLoading(false); return }
    const coords = draft.startLat != null && draft.startLng != null
      ? { lat: draft.startLat, lng: draft.startLng }
      : undefined
    getCommunityTrips(draft.communityCode, coords, 10, direction)
      .then(async (found) => {
        setRides(found)
        // Record the search as demand signal. A zero-result search is unmet
        // demand and cannot be recovered later, so log it as it happens.
        const id = await recordRideWant({
          code: draft.communityCode!,
          place: draft.startingPlace,
          lat: draft.startLat,
          lng: draft.startLng,
          results: found.length,
          direction,
        })
        setWantId(id)
      })
      .catch(e => setError(e?.message ?? 'Could not load rides.'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.communityCode])

  // "Notify me" has to actually put the rider on the list, not just say so.
  const handleNotify = async () => {
    setNotified(true)
    if (wantId) await setRideWantNotify(wantId, true)
  }

  const handleSelect = (ride: RideRow) => {
    router.push(`/find/ride/${ride.id}`)
  }

  const hasRides = rides.length > 0

  const renderSection = (label: string, items: RideRow[]) =>
    items.length === 0 ? null : (
      <div>
        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3 px-1">{label}</p>
        <div className="flex flex-col gap-4">
          {items.map(ride => <RideCard key={ride.id} ride={ride} onSelect={() => handleSelect(ride)} />)}
        </div>
      </div>
    )

  let body: React.ReactNode
  if (loading) {
    body = <div className="flex flex-col gap-4"><SkeletonCard /><SkeletonCard /></div>
  } else if (error) {
    body = <p className="text-sm text-red-500">{error}</p>
  } else if (hasRides) {
    const near = rides.filter(r => r.distance_km != null && r.distance_km <= NEAR_KM)
    const area = rides.filter(r => r.distance_km != null && r.distance_km > NEAR_KM)
    const other = rides.filter(r => r.distance_km == null)
    const matched = near.length > 0 || area.length > 0

    body = matched ? (
      <div className="flex flex-col gap-8">
        {renderSection('Near you', near)}
        {renderSection('Also in your area', area)}
        {renderSection('Other rides', other)}
      </div>
    ) : (
      // No rider location to match against → flat list
      <div className="flex flex-col gap-4">
        {rides.map(ride => <RideCard key={ride.id} ride={ride} onSelect={() => handleSelect(ride)} />)}
      </div>
    )
  } else {
    body = (
      <div className="flex flex-col items-center justify-center text-center min-h-[50vh] px-4">
        <h2 className="text-2xl font-bold text-black mb-3">
          {notified ? 'You’re on the list!' : returning ? 'No rides back just yet' : 'No rides just yet'}
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
          {notified
            ? 'We’ll notify you the moment someone from your community offers a ride on your route.'
            : returning
              ? 'No one’s offered a ride back your way yet. We’ll let you know as soon as one appears.'
              : 'No one’s offered a ride on your route yet. We’ll let you know as soon as one appears.'}
        </p>
      </div>
    )
  }

  let footer: React.ReactNode
  if (loading || hasRides || error) {
    footer = (
      <button onClick={() => router.back()} className="w-full py-3.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
        Back
      </button>
    )
  } else if (!notified) {
    footer = (
      <button onClick={handleNotify} className="w-full py-3.5 rounded-xl text-sm font-medium bg-black text-white hover:bg-gray-800 active:scale-[0.98] transition-all">
        Notify me
      </button>
    )
  } else {
    footer = (
      <button onClick={() => router.push('/')} className="w-full py-3.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
        Back to home
      </button>
    )
  }

  return (
    <FindFlowShell
      context={returning ? 'Find a ride back' : 'Find a ride'}
      title={returning ? 'Rides heading your way' : 'Rides passing your route'}
      subtitle={!loading && hasRides ? `${rides.length} ${rides.length === 1 ? 'ride' : 'rides'}` : undefined}
      communityName={draft.communityName}
      footer={footer}
    >
      {body}
    </FindFlowShell>
  )
}
