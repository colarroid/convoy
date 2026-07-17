'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FindFlowShell from '@/components/FindFlowShell'
import { getFindDraft, saveFindDraft } from '@/lib/findStore'
import type { TripDirection } from '@/lib/trips'
import DirectionChoice from '@/components/DirectionChoice'

/** Which way is the rider going relative to the community? */
export default function FindDirectionPage() {
  const router = useRouter()
  const [draft, setDraft] = useState(getFindDraft())
  const [direction, setDirection] = useState<TripDirection>('to_community')

  useEffect(() => {
    const d = getFindDraft()
    setDraft(d)
    if (d.direction) setDirection(d.direction)
  }, [])

  const handleContinue = () => {
    saveFindDraft({ direction })
    router.push('/find/location')
  }

  const place = draft.communityName ?? 'your community'

  return (
    <FindFlowShell
      context="Find a ride"
      title="Which way are you going?"
      subtitle="Your community code covers both directions."
      communityName={draft.communityName}
      footer={
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="flex-1 py-3.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
            Back
          </button>
          <button
            onClick={handleContinue}
            className="flex-[2] py-3.5 rounded-xl text-sm font-medium bg-black text-white hover:bg-gray-800 transition-all active:scale-[0.98]"
          >
            Continue
          </button>
        </div>
      }
    >
      <DirectionChoice place={place} value={direction} onChange={setDirection} />
    </FindFlowShell>
  )
}
