'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OfferFlowShell from '@/components/OfferFlowShell'
import { saveDraft, getDraft } from '@/lib/offerStore'

const COLORS = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Blue', hex: '#1a56db' },
  { name: 'Red', hex: '#e02424' },
  { name: 'Green', hex: '#057a55' },
  { name: 'Gold', hex: '#d4a017' },
  { name: 'Brown', hex: '#7B4F2E' },
]

export default function OfferVehiclePage() {
  const router = useRouter()
  const draft = getDraft()

  const [make, setMake] = useState(draft.vehicleMake ?? '')
  const [model, setModel] = useState(draft.vehicleModel ?? '')
  const [plate, setPlate] = useState(draft.plateNumber ?? '')
  const [color, setColor] = useState(draft.color ?? 'Blue')
  const [showColorDrop, setShowColorDrop] = useState(false)
  const [unknown, setUnknown] = useState(draft.unknownVehicle ?? false)
  const [seats, setSeats] = useState(draft.seats ?? 1)

  const selectedColor = COLORS.find(c => c.name === color) ?? COLORS[4]
  const canContinue = unknown || (make.trim().length > 0 && model.trim().length > 0)

  const handleContinue = () => {
    saveDraft({ vehicleMake: unknown ? '' : make.trim(), vehicleModel: unknown ? '' : model.trim(), plateNumber: unknown ? '' : plate.trim(), color: unknown ? '' : color, unknownVehicle: unknown, seats })
    router.push('/offer/review')
  }

  return (
    <OfferFlowShell
      context="Offer a ride"
      title="Tell us about the car"
      subtitle="This helps riders recognise the ride at the pickup spot."
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
      <p className="text-sm font-semibold text-black mb-2">Vehicle type</p>
      <div className={`flex flex-col gap-2 mb-4 transition-opacity ${unknown ? 'opacity-40 pointer-events-none' : ''}`}>
        <input type="text" placeholder="Make (e.g. Toyota)" value={make} onChange={e => setMake(e.target.value)} className="input-field" />
        <input type="text" placeholder="Model (e.g. Camry)" value={model} onChange={e => setModel(e.target.value)} className="input-field" />
        <div className="flex gap-2">
          <input type="text" placeholder="Plate No. (XX-XXX-XX)" value={plate} onChange={e => setPlate(e.target.value.toUpperCase())} className="input-field flex-1" />
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorDrop(!showColorDrop)}
              className="h-full px-3 py-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-black whitespace-nowrap"
            >
              <span className="w-4 h-4 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: selectedColor.hex }} />
              <span>{selectedColor.name}</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showColorDrop && (
              <div className="absolute top-full right-0 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                {COLORS.map(c => (
                  <button key={c.name} type="button" onClick={() => { setColor(c.name); setShowColorDrop(false) }}
                    className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-2.5 transition-colors ${c.name === color ? 'bg-gray-50 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>
                    <span className="w-4 h-4 rounded-full border border-gray-200 shrink-0" style={{ backgroundColor: c.hex }} />
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">or</span><div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        type="button"
        onClick={() => setUnknown(!unknown)}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left
          ${unknown ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${unknown ? 'border-black bg-black' : 'border-gray-300'}`}>
          {unknown && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        </div>
        <span className="text-sm text-gray-700">I don&apos;t know yet (Uber, Bolt or In-drive)</span>
      </button>

      <div className="h-px bg-gray-100 my-5" />

      <p className="text-sm font-semibold text-black mb-3">Seats available</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(n => (
          <button key={n} type="button" onClick={() => setSeats(n)}
            className={`flex-1 aspect-square rounded-xl border-2 text-lg font-bold transition-all active:scale-95
              ${seats === n ? 'border-black bg-white text-black' : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-400'}`}>
            {n}
          </button>
        ))}
      </div>
    </OfferFlowShell>
  )
}
