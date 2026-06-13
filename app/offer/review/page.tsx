'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import OfferFlowShell from '@/components/OfferFlowShell'
import { getDraft, clearDraft, type OfferDraft } from '@/lib/offerStore'
import { getUser, getDisplayName, getInitials } from '@/lib/userStore'
import { createTrip, getRidesCompleted, ridesLabel } from '@/lib/trips'

function formatDate(iso: string) {
  if (!iso) return '—'
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

  useEffect(() => {
    setDraft(getDraft())
    const u = getUser()
    setDisplayName(getDisplayName(u))
    setInitials(getInitials(u))
    setPhoto(u?.photoDataUrl ?? null)
    getRidesCompleted().then(setRidesCompleted).catch(() => {})
  }, [])

  const vehicleDesc = draft.unknownVehicle
    ? 'Hired ride (Uber / Bolt / In-drive)'
    : [draft.color, draft.vehicleMake, draft.vehicleModel].filter(Boolean).join(' ')

  const handlePost = async () => {
    setPosting(true)
    setError('')
    try {
      await createTrip(getDraft())
      clearDraft()
      router.push('/offer/posted')
    } catch (e) {
      setPosting(false)
      setError(e instanceof Error ? e.message : 'Could not post your ride. Please try again.')
    }
  }

  return (
    <OfferFlowShell
      context="Offer a ride"
      title="Review & post"
      subtitle="People looking for a ride in your community will be able to request this trip."
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
          <ReviewRow label="Destination" value={draft.communityName ?? '—'} editHref="/offer/community" />
          <ReviewRow label="Date & time" value={`${formatDate(draft.date ?? '')} · ${draft.time ?? '—'}`} editHref="/offer/datetime" />
          <ReviewRow label="Pickup point" value={draft.pickupPlace ?? '—'} sub={draft.pickupNote || undefined} editHref="/offer/pickup" />
          <ReviewRow label="Ride details" value={vehicleDesc || '—'} editHref="/offer/vehicle" />
          <div className="py-3.5">
            <p className="text-xs text-gray-400 mb-0.5">Seats</p>
            <p className="text-sm font-bold text-black">{draft.seats ?? 1} of {draft.seats ?? 1} open</p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2.5 mt-5 px-1">
        <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <p className="text-xs text-gray-500 leading-relaxed">
          Your potential guests only ever see the address shared as pickup point — not your home address.
        </p>
      </div>
    </OfferFlowShell>
  )
}
