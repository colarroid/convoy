'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FindFlowShell from '@/components/FindFlowShell'
import { getCommunityByCode } from '@/lib/trips'
import { saveFindDraft } from '@/lib/findStore'

interface Community {
  id: string
  code: string
  name: string
  address: string | null
  area: string | null
  banner_color: string | null
}

export default function FindCommunityPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [match, setMatch] = useState<Community | null>(null)
  const [checking, setChecking] = useState(false)
  const [noMatch, setNoMatch] = useState(false)

  // Debounced validation against the DB
  useEffect(() => {
    const trimmed = code.trim()
    setMatch(null)
    setNoMatch(false)
    if (trimmed.length < 4) { setChecking(false); return }

    setChecking(true)
    const t = setTimeout(async () => {
      try {
        const c = await getCommunityByCode(trimmed)
        setMatch(c)
        setNoMatch(!c)
      } catch {
        setNoMatch(true)
      } finally {
        setChecking(false)
      }
    }, 450)
    return () => clearTimeout(t)
  }, [code])

  const handleContinue = () => {
    if (!match) return
    saveFindDraft({ communityCode: match.code, communityName: match.name, communityAddress: match.address ?? undefined, communityArea: match.area ?? undefined })
    router.push('/find/location')
  }

  return (
    <FindFlowShell
      context="Find a ride"
      title="Where are you going?"
      subtitle="Enter your community code"
      footer={
        <button
          onClick={handleContinue}
          disabled={!match}
          className={`w-full py-3.5 rounded-xl text-sm font-medium transition-all
            ${match ? 'bg-black text-white hover:bg-gray-800 active:scale-[0.98]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          Continue
        </button>
      }
    >
      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-full border-2 bg-white transition-all
        ${match ? 'border-black' : noMatch ? 'border-red-400' : 'border-gray-200 focus-within:border-black'}`}
      >
        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
        </svg>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. THNC-SABO"
          autoFocus
          className="flex-1 bg-transparent text-sm text-black placeholder-gray-400 focus:outline-none font-medium tracking-wide"
        />
        {checking && (
          <svg className="animate-spin w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {code.length > 0 && !checking && (
          <button type="button" onClick={() => setCode('')} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
            </svg>
          </button>
        )}
      </div>

      {noMatch && (
        <p className="text-xs text-red-500 mt-2 px-1">Code not recognised. Check with your community admin.</p>
      )}

      {match && (
        <div className="mt-5 rounded-2xl border border-gray-200 overflow-hidden shadow-sm animate-fade-up">
          <div className="h-36 flex flex-col items-center justify-center" style={{ backgroundColor: match.banner_color ?? '#111111' }}>
            <p className="text-white text-xs font-semibold tracking-[0.2em] opacity-70">HOPE</p>
            <p className="text-2xl font-black tracking-tight" style={{ color: '#c0392b' }}>NATION</p>
            <div className="h-0.5 w-12 mt-1" style={{ backgroundColor: '#c0392b' }} />
          </div>
          <div className="px-4 py-4 bg-white">
            <p className="font-bold text-black">{match.name}</p>
            {match.address && (
              <p className="text-xs text-gray-500 mt-1 flex items-start gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {match.address}
              </p>
            )}
          </div>
        </div>
      )}
    </FindFlowShell>
  )
}
