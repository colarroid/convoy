'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FindFlowShell from '@/components/FindFlowShell'
import DestinationBanner from '@/components/DestinationBanner'
import AddressAutocomplete, { type PlaceCoords } from '@/components/AddressAutocomplete'
import { geocodeAddress } from '@/lib/googleMaps'
import { saveFindDraft, getFindDraft } from '@/lib/findStore'

export default function FindLocationPage() {
  const router = useRouter()
  const draft = getFindDraft()
  const [search, setSearch] = useState('')
  const [coords, setCoords] = useState<PlaceCoords | undefined>(undefined)
  const [finding, setFinding] = useState(false)

  // The last location used (from a previous search), offered as a quick tap.
  const recent = draft.startingPlace
    ? {
        place: draft.startingPlace,
        coords: draft.startLat != null && draft.startLng != null ? { lat: draft.startLat, lng: draft.startLng } : undefined,
      }
    : null

  const canContinue = search.trim().length > 0

  const handleContinue = async () => {
    setFinding(true)
    let lat = coords?.lat, lng = coords?.lng
    if ((lat == null || lng == null) && search.trim()) {
      const g = await geocodeAddress(search.trim())
      if (g) { lat = g.lat; lng = g.lng }
    }
    saveFindDraft({ startingPlace: search.trim(), startLat: lat, startLng: lng })
    router.push('/find/results')
  }

  return (
    <FindFlowShell
      context="Find a ride"
      title="Where are you coming from?"
      subtitle="So we can show rides passing near you"
      communityName={draft.communityName}
      footer={
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="flex-1 py-3.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!canContinue || finding}
            className={`flex-[2] py-3.5 rounded-xl text-sm font-medium transition-all
              ${canContinue && !finding ? 'bg-black text-white hover:bg-gray-800 active:scale-[0.98]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            {finding ? 'Finding…' : 'Find rides'}
          </button>
        </div>
      }
    >
      <DestinationBanner name={draft.communityName} address={draft.communityAddress ?? draft.communityArea} />

      <AddressAutocomplete
        value={search}
        onChange={(text, c) => { setSearch(text); setCoords(c) }}
        placeholder="Enter your starting location"
        autoFocus
        wrapperClassName={`flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gray-100 transition-all ${search ? 'ring-2 ring-black bg-white' : 'focus-within:ring-2 focus-within:ring-black focus-within:bg-white'}`}
        leftAdornment={<span className="w-3 h-3 rounded-full border-[3px] border-black shrink-0" />}
        rightAdornment={
          search.length > 0 ? (
            <button type="button" onClick={() => { setSearch(''); setCoords(undefined) }} className="text-gray-400 hover:text-gray-600 shrink-0" aria-label="Clear">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" /></svg>
            </button>
          ) : undefined
        }
      />

      {!search && recent && (
        <button
          type="button"
          onClick={() => { setSearch(recent.place); setCoords(recent.coords) }}
          className="mt-3 inline-flex items-center gap-2 max-w-full px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-left transition-colors"
        >
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-gray-400 shrink-0">Recent</span>
          <span className="text-sm font-medium text-black truncate">{recent.place}</span>
        </button>
      )}
    </FindFlowShell>
  )
}
