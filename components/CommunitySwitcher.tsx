'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CommunityLogo from '@/components/CommunityLogo'
import { getMyCommunities, joinCommunityByCode, type HeldCommunity } from '@/lib/communities'
import { saveDraft } from '@/lib/offerStore'
import { saveFindDraft } from '@/lib/findStore'

/** "Jump back in" — held communities a returning user can act on without retyping a code. */
export default function CommunitySwitcher() {
  const router = useRouter()
  const [held, setHeld] = useState<HeldCommunity[]>([])

  useEffect(() => {
    getMyCommunities().then(setHeld).catch(() => {})
  }, [])

  if (held.length === 0) return null

  const go = async (c: HeldCommunity, mode: 'find' | 'offer') => {
    let comm: { name?: string; address?: string | null } | null = null
    try { comm = await joinCommunityByCode(c.code) } catch { /* best-effort */ }
    const name = comm?.name ?? c.name
    const address = comm?.address ?? undefined
    if (mode === 'find') {
      saveFindDraft({ communityCode: c.code, communityName: name, communityAddress: address, communityArea: c.area ?? undefined })
      router.push('/find/location')
    } else {
      saveDraft({ communityCode: c.code, communityName: name, communityAddress: address })
      router.push('/offer/pickup')
    }
  }

  return (
    <div className="px-1">
      <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Your communities</p>
      <div className="flex flex-col gap-3">
        {held.map(c => (
          <div key={c.community_id} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 pt-4 pb-3">
              <CommunityLogo src={c.logo_url} name={c.name} className="w-11 h-11" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-black truncate">{c.name}</p>
                {c.area && <p className="text-xs text-gray-400 truncate">{c.area}</p>}
              </div>
            </div>
            <div className="flex gap-2 px-4 pb-4">
              <button onClick={() => go(c, 'find')} className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all">
                Find a ride
              </button>
              <button onClick={() => go(c, 'offer')} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-black text-sm font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all">
                Offer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
