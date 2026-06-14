'use client'

import { useEffect, useState } from 'react'
import { getMySuspended } from './profile'

/** Reactive suspension state for the signed-in user. */
export function useSuspended() {
  const [suspended, setSuspended] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let on = true
    getMySuspended()
      .then(s => { if (on) setSuspended(s) })
      .catch(() => {})
      .finally(() => { if (on) setLoading(false) })
    return () => { on = false }
  }, [])

  return { suspended, loading }
}
