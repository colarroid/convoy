'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OfferFlowShell from '@/components/OfferFlowShell'
import AddressAutocomplete, { type PlaceCoords } from '@/components/AddressAutocomplete'
import { geocodeAddress } from '@/lib/googleMaps'
import { saveDraft, getDraft } from '@/lib/offerStore'

export default function OfferPickupPage() {
  const router = useRouter()
  const draft = getDraft()
  const [search, setSearch] = useState(draft.pickupPlace ?? '')
  const [coords, setCoords] = useState<PlaceCoords | undefined>(
    draft.pickupLat != null && draft.pickupLng != null ? { lat: draft.pickupLat, lng: draft.pickupLng } : undefined
  )
  const [note, setNote] = useState(draft.pickupNote ?? '')
  const [saving, setSaving] = useState(false)

  const canContinue = search.trim().length > 0

  const handleContinue = async () => {
    setSaving(true)
    let lat = coords?.lat, lng = coords?.lng
    // If they typed without picking a suggestion, geocode the text so the ride
    // still has a location to match against.
    if ((lat == null || lng == null) && search.trim()) {
      const g = await geocodeAddress(search.trim())
      if (g) { lat = g.lat; lng = g.lng }
    }
    saveDraft({ pickupPlace: search.trim(), pickupNote: note.trim(), pickupLat: lat, pickupLng: lng })
    router.push('/offer/datetime')
  }

  return (
    <OfferFlowShell
      context="Offer a ride"
      title="Add a pickup point"
      subtitle="One clear spot along your route where riders can meet you."
      communityName={draft.communityName}
      footer={
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="flex-1 py-3.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">Back</button>
          <button
            onClick={handleContinue}
            disabled={!canContinue || saving}
            className={`flex-[2] py-3.5 rounded-xl text-sm font-medium transition-all
              ${canContinue && !saving ? 'bg-black text-white hover:bg-gray-800 active:scale-[0.98]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >{saving ? 'Saving…' : 'Continue'}</button>
        </div>
      }
    >
      <AddressAutocomplete
        value={search}
        onChange={(text, c) => { setSearch(text); setCoords(c) }}
        placeholder="Search a place or landmark"
        autoFocus
        leftAdornment={<svg className="w-4 h-4 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /></svg>}
        rightAdornment={
          search.length > 0 ? (
            <button type="button" onClick={() => { setSearch(''); setCoords(undefined) }} className="text-gray-400 hover:text-gray-600 shrink-0" aria-label="Clear">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" /></svg>
            </button>
          ) : undefined
        }
      />

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Additional note (optional), e.g. wait by the filling station"
        rows={3}
        className="w-full mt-3 px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white resize-none transition-all"
      />
    </OfferFlowShell>
  )
}
