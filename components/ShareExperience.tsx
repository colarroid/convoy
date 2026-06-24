'use client'

import { useState } from 'react'
import { submitExperience } from '@/lib/experiences'

const MAX = 280

/** Editable "share your experience" form. Calls onSaved once submitted; the
 *  parent then locks it in (a member can't edit it again for now). */
export default function ShareExperience({ onSaved }: { onSaved: (body: string) => void }) {
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = body.trim()
    if (!text || busy) return
    setBusy(true)
    setError('')
    try {
      await submitExperience(text)
      onSaved(text)
    } catch {
      setError('Could not save. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mb-7">
      <p className="mb-2 px-1 text-xs font-bold uppercase tracking-widest text-gray-400">Share your experience</p>
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-sm leading-relaxed text-gray-500">
          Tell other neighbours what riding with your community has been like. Once shared it&apos;s locked in,
          so take a moment with it.
        </p>
        <form onSubmit={submit} className="mt-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, MAX))}
            placeholder="What has Veesaa been like for you?"
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">{body.length}/{MAX}</span>
            <div className="flex items-center gap-3">
              {error && <span className="text-xs text-red-500">{error}</span>}
              <button
                type="submit"
                disabled={busy || !body.trim()}
                className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {busy ? 'Sharing…' : 'Share'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
