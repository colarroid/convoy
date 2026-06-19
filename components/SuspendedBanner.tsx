'use client'

import { useSuspended } from '@/lib/useSuspended'

/** Shown across authed pages when the user's account is suspended. */
export default function SuspendedBanner() {
  const { suspended } = useSuspended()
  if (!suspended) return null
  return (
    <div className="bg-red-50 border-b border-red-200 text-red-700 text-xs md:text-sm px-5 md:px-8 py-2.5 text-center">
      Your account is suspended. You can browse, but can&apos;t offer or join rides. Please contact your community admin.
    </div>
  )
}
