'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import OfferFlowShell from '@/components/OfferFlowShell'
import { getDraft, saveDraft, clearDraft, type OfferDraft } from '@/lib/offerStore'
import { getUser, getDisplayName, getInitials } from '@/lib/userStore'
import { createTrip, getRidesCompleted, ridesLabel } from '@/lib/trips'
import TimePicker from '@/components/TimePicker'

function formatDate(iso: string) {
  if (!iso) return '-'
  const [y, m, d] = iso.split('-')
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function ReviewRow({ label, value, sub, editHref }: { label: string; value: string; sub?: string; editHref: string }) {
  const router = useRouter()
  return (
    <div className="py-3.5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-bold text-black leading-snug">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
      <button onClick={() => router.push(editHref)} className="text-sm font-semibold text-blue-600 hover:text-blue-700 shrink-0 pt-0.5">Edit</button>
    </div>
  )
}

export default function OfferReviewPage() {
  const router = useRouter()
  const [draft, setDraft] = useState<OfferDraft>({})
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')
  const [displayName, setDisplayName] = useState('You')
  const [initials, setInitials] = useState('?')
  const [photo, setPhoto] = useState<string | null>(null)
  const [ridesCompleted, setRidesCompleted] = useState(0)
  // "Driving back" opt-in. Date is fixed to the outbound's; only seats and the
  // departure time can differ, since it is the same car making the same trip.
  const [returning, setReturning] = useState(false)
  const [returnTime, setReturnTime] = useState('05:00 PM')
  const [returnSeats, setReturnSeats] = useState(1)

  useEffect(() => {
    const d = getDraft()
    setDraft(d)
    setReturning(!!d.returning)
    if (d.returnTime) setReturnTime(d.returnTime)
    setReturnSeats(d.returnSeats ?? d.seats ?? 1)
    const u = getUser()
    setDisplayName(getDisplayName(u))
    setInitials(getInitials(u))
    setPhoto(u?.photoDataUrl ?? null)
    getRidesCompleted().then(setRidesCompleted).catch(() => {})
  }, [])

  const isStandaloneReturn = draft.direction === 'from_community'

  const vehicleDesc = draft.unknownVehicle
    ? 'Hired ride (Uber / Bolt / In-drive)'
    : [draft.color, draft.vehicleMake, draft.vehicleModel].filter(Boolean).join(' ')

  const handlePost = async () => {
    setPosting(true)
    setError('')
    try {
      await createTrip({
        ...getDraft(),
        returning,
        returnTime: returning ? returnTime : undefined,
        returnSeats: returning ? returnSeats : undefined,
      })
      clearDraft()
      router.push('/offer/posted')
    } catch (e) {
      setPosting(false)
      setError(e instanceof Error ? e.message : 'Could not post your ride. Please try again.')
    }
  }

  return (
    <OfferFlowShell
      context={isStandaloneReturn ? 'Offer a ride back' : 'Offer a ride'}
      title="Review & post"
      subtitle={isStandaloneReturn
        ? 'People in your community looking for a ride back will be able to request this trip.'
        : 'People looking for a ride in your community will be able to request this trip.'}
      communityName={draft.communityName}
      footer={
        <div>
          {error && <p className="text-sm text-red-500 text-center mb-3">{error}</p>}
          <div className="flex gap-3">
            <button onClick={() => router.back()} className="flex-1 py-3.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">Edit</button>
            <button
              onClick={handlePost}
              disabled={posting}
              className="flex-[2] py-3.5 rounded-xl text-sm font-medium bg-black text-white hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {posting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Posting…
                </span>
              ) : 'Post'}
            </button>
          </div>
        </div>
      }
    >
      <div className="rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden flex items-center justify-center text-white text-sm font-bold shrink-0">
            {photo
              ? <img src={photo} alt="avatar" className="w-full h-full object-cover" />
              : initials
            }
          </div>
          <div>
            <p className="text-sm font-bold text-black">{displayName}</p>
            <p className="text-xs text-gray-400">{ridesLabel(ridesCompleted)}</p>
          </div>
        </div>
        <div className="px-4 divide-y divide-gray-100">
          <ReviewRow
            label={isStandaloneReturn ? 'Setting off from' : 'Destination'}
            value={draft.communityName ?? '-'}
            editHref="/offer/community"
          />
          <ReviewRow label="Date & time" value={`${formatDate(draft.date ?? '')} · ${draft.time ?? '-'}`} editHref="/offer/datetime" />
          <ReviewRow
            label={isStandaloneReturn ? 'Drop-off point' : 'Pickup point'}
            value={draft.pickupPlace ?? '-'}
            sub={draft.pickupNote || undefined}
            editHref="/offer/pickup"
          />
          <ReviewRow label="Ride details" value={vehicleDesc || '-'} editHref="/offer/vehicle" />
          <div className="py-3.5">
            <p className="text-xs text-gray-400 mb-0.5">Seats</p>
            <p className="text-sm font-bold text-black">{draft.seats ?? 1} of {draft.seats ?? 1} open</p>
          </div>
        </div>
      </div>

      {/* ── Driving back? Posts a separate return trip on the same day.
             Not offered on a standalone return: it is already the ride back. ── */}
      {!isStandaloneReturn && (
      <div className="mt-5 rounded-2xl border border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={() => { const next = !returning; setReturning(next); saveDraft({ returning: next }) }}
          aria-pressed={returning}
          className="w-full px-4 py-4 flex items-start gap-3 text-left"
        >
          <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${returning ? 'border-black bg-black' : 'border-gray-300 bg-white'}`}>
            {returning && (
              <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-black">I&apos;m also driving back</span>
            <span className="block text-xs text-gray-500 mt-0.5 leading-relaxed">
              Posts a separate ride back from {draft.communityName ?? 'the community'} on the same day, so people can find it early.
            </span>
          </span>
        </button>

        {returning && (
          <div className="border-t border-gray-100 px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-400">Date</p>
              <p className="text-sm font-bold text-black">{formatDate(draft.date ?? '')}</p>
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-400">Drop-off point</p>
              <p className="text-sm font-bold text-black truncate ml-4">{draft.pickupPlace ?? '-'}</p>
            </div>

            <p className="text-sm font-semibold text-black mb-3">Seats on the way back</p>
            <div className="flex gap-2 mb-5">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => { setReturnSeats(n); saveDraft({ returnSeats: n }) }}
                  className={`h-10 w-10 rounded-xl text-sm font-semibold transition-all ${
                    returnSeats === n ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <p className="text-sm font-semibold text-black mb-3">Departure time</p>
            <TimePicker value={returnTime} onChange={(t) => { setReturnTime(t); saveDraft({ returnTime: t }) }} />
          </div>
        )}
      </div>
      )}

      <div className="flex items-start gap-2.5 mt-5 px-1">
        <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <p className="text-xs text-gray-500 leading-relaxed">
          Your potential guests only ever see the address shared as pickup point, not your home address.
        </p>
      </div>
    </OfferFlowShell>
  )
}
