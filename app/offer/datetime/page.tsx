'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OfferFlowShell from '@/components/OfferFlowShell'
import TimePicker from '@/components/TimePicker'
import DatePicker from '@/components/DatePicker'
import { saveDraft, getDraft } from '@/lib/offerStore'

export default function OfferDatetimePage() {
  const router = useRouter()
  const draft = getDraft()

  const [date, setDate] = useState(draft.date ?? '')
  const [time, setTime] = useState(draft.time ?? '08:00 AM')

  const today = new Date().toISOString().split('T')[0]
  const canContinue = date.length > 0

  const handleContinue = () => {
    saveDraft({ date, time })
    router.push('/offer/vehicle')
  }

  return (
    <OfferFlowShell
      context="Offer a ride"
      title="When are you leaving?"
      subtitle="Set the day and time you plan to set off."
      communityName={draft.communityName}
      footer={
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="flex-1 py-3.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">Back</button>
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`flex-[2] py-3.5 rounded-xl text-sm font-medium transition-all
              ${canContinue ? 'bg-black text-white hover:bg-gray-800 active:scale-[0.98]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >Continue</button>
        </div>
      }
    >
      {/* ── Date ── */}
      <p className="text-sm font-semibold text-black mb-3">Date</p>
      <DatePicker value={date} min={today} onChange={setDate} />

      {/* ── Time ── */}
      <p className="text-sm font-semibold text-black mb-4">Time</p>
      <TimePicker value={time} onChange={setTime} />
    </OfferFlowShell>
  )
}
