/* Client-side helpers to associate the OneSignal subscription with the
   signed-in Supabase user (via external id) so we can target pushes. */

/* eslint-disable @typescript-eslint/no-explicit-any */

function deferred(fn: (os: any) => void) {
  if (typeof window === 'undefined') return
  const w = window as any
  w.OneSignalDeferred = w.OneSignalDeferred || []
  w.OneSignalDeferred.push(fn)
}

let lastLinked: string | null = null

export function linkOneSignal(userId: string) {
  if (lastLinked === userId) return
  lastLinked = userId
  deferred(async (OneSignal) => {
    try {
      await OneSignal.login(userId)
      // Ask permission if not already decided (no-op if already granted/denied)
      if (OneSignal.Notifications?.permission === false) {
        await OneSignal.Slidedown?.promptPush?.()
      }
    } catch { /* ignore */ }
  })
}

export function unlinkOneSignal() {
  lastLinked = null
  deferred(async (OneSignal) => {
    try { await OneSignal.logout() } catch { /* ignore */ }
  })
}
