'use client'

import { useState } from 'react'
import { submitReport, REPORT_CATEGORIES, type ReportCategory } from '@/lib/reports'

interface ReportModalProps {
  open: boolean
  onClose: () => void
  /** Who/what is being reported (optional, omit for a general report). */
  reportedUserId?: string
  reportedName?: string
  tripId?: string
}

export default function ReportModal({ open, onClose, reportedUserId, reportedName, tripId }: ReportModalProps) {
  const [category, setCategory] = useState<ReportCategory | null>(null)
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const close = () => {
    onClose()
    // reset after the close animation
    setTimeout(() => { setCategory(null); setDetails(''); setDone(false); setError('') }, 200)
  }

  const handleSubmit = async () => {
    if (!category) return
    setSubmitting(true)
    setError('')
    try {
      await submitReport({ reportedUserId, tripId, category, details })
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit your report.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={close} />

      <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 pb-7 sm:pb-5 shadow-xl animate-slide-up max-h-[90vh] overflow-y-auto">
        {done ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4 animate-pop">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            </div>
            <h2 className="text-lg font-bold text-black mb-2">Report submitted</h2>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto mb-5">
              Thank you. Our team will review this. If you&apos;re in immediate danger, contact local authorities.
            </p>
            <button onClick={close} className="w-full py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-all">Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-black">Report a concern</h2>
              <button onClick={close} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors" aria-label="Close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-5">
              {reportedName ? `About ${reportedName}. ` : ''}This is confidential.
            </p>

            <p className="text-xs font-semibold text-gray-500 mb-2">What happened?</p>
            <div className="flex flex-col gap-2 mb-4">
              {REPORT_CATEGORIES.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all
                    ${category === c.value ? 'border-black bg-gray-50 font-semibold text-black' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                >
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${category === c.value ? 'border-black' : 'border-gray-300'}`}>
                    {category === c.value && <span className="w-2 h-2 rounded-full bg-black" />}
                  </span>
                  {c.label}
                </button>
              ))}
            </div>

            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Add any details that would help us understand (optional)"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all resize-none mb-1"
            />

            {error && <p className="text-xs text-red-500 px-1 mb-2">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={!category || submitting}
              className="w-full mt-3 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              {submitting ? 'Submitting…' : 'Submit report'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
