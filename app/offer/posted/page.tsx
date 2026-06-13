'use client'

import Link from 'next/link'
import OfferFlowShell from '@/components/OfferFlowShell'

export default function OfferPostedPage() {
  return (
    <OfferFlowShell
      footer={
        <div className="flex flex-col gap-3">
          <Link
            href="/my-trips"
            className="w-full text-center py-3.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all"
          >
            View my trip
          </Link>
          <Link
            href="/"
            className="w-full text-center py-3.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all"
          >
            Back to home
          </Link>
        </div>
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
          Your trip is posted.
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed max-w-xs animate-fade-up" style={{ animationDelay: '200ms' }}>
          We&apos;ll let you know when someone asks to join. You can manage it anytime.
        </p>
      </div>
    </OfferFlowShell>
  )
}
