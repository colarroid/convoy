'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import OfferFlowShell from '@/components/OfferFlowShell'
import DirectionChoice from '@/components/DirectionChoice'
import { getDraft, saveDraft } from '@/lib/offerStore'
import type { TripDirection } from '@/lib/trips'

/**
 * Which way is the host driving? Someone who drove themselves to the community
 * and has spare seats going home is a perfect host, so a return has to be
 * offerable on its own, not only as a tick-box on an outbound.
 */
export default function OfferDirectionPage() {
  const router = useRouter()
  const [draft, setDraft] = useState(getDraft())
  const [direction, setDirection] = useState<TripDirection>('to_community')

  useEffect(() => {
    const d = getDraft()
    setDraft(d)
    if (d.direction) setDirection(d.direction)
  }, [])

  const handleContinue = () => {
    // A standalone return has no outbound to mirror, so it can't also carry one.
    saveDraft({
      direction,
      ...(direction === 'from_community' ? { returning: false, returnTime: undefined, returnSeats: undefined } : {}),
    })
    router.push('/offer/pickup')
  }

  return (
    <OfferFlowShell
      context="Offer a ride"
      title="Which way are you driving?"
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
      <DirectionChoice
        place={draft.communityName ?? 'your community'}
        value={direction}
        onChange={setDirection}
        forHost
      />
    </OfferFlowShell>
  )
}
