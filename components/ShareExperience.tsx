'use client'

import { useEffect, useState } from 'react'
import { getMyExperience, submitExperience } from '@/lib/experiences'

const MAX = 280

/** Profile section where a member shares (or updates) their experience. */
export default function ShareExperience() {
  const [body, setBody] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [hadOne, setHadOne] = useState(false)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getMyExperience()
      .then((e) => { if (e) { setBody(e.body); setHadOne(true) } })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      await submitExperience(body.trim())
      setHadOne(true)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
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
          Tell other neighbours what riding with your community has been like. Approved experiences may be
          featured on Veesaa.
        </p>
        <form onSubmit={submit} className="mt-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, MAX))}
            placeholder="What has Veesaa been like for you?"
            rows={3}
            disabled={!loaded}
            className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">{body.length}/{MAX}</span>
            <div className="flex items-center gap-3">
              {saved && <span className="text-xs font-medium text-green-600">Saved</span>}
              {error && <span className="text-xs text-red-500">{error}</span>}
              <button
                type="submit"
                disabled={busy || !body.trim()}
                className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {busy ? 'Saving…' : hadOne ? 'Update' : 'Share'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
