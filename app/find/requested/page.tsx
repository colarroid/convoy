'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import FindFlowShell from '@/components/FindFlowShell'
import { getFindDraft } from '@/lib/findStore'

function RequestedContent() {
  const params = useSearchParams()
  const draft = getFindDraft()
  const hostFirstName = params.get('host') || 'The host'

  return (
    <FindFlowShell
      communityName={draft.communityName}
      footer={
        <Link
          href="/find/results"
          className="w-full block text-center py-3.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all"
        >
          Back to rides
        </Link>
      }
    >
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-10">
        <div className="animate-pop mb-6">
          <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-black mb-3 animate-fade-up" style={{ animationDelay: '120ms' }}>
          Request sent.
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed max-w-xs animate-fade-up" style={{ animationDelay: '200ms' }}>
          {hostFirstName} will confirm shortly. We&apos;ll notify you as soon as they do.
        </p>
      </div>
    </FindFlowShell>
  )
}

export default function RequestedPage() {
  return <Suspense><RequestedContent /></Suspense>
}
