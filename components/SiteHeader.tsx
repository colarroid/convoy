'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import AppNav from '@/components/AppNav'
import { getUser } from '@/lib/userStore'

/**
 * The one header for every public page: the signed-in app nav when there is a
 * session, the marketing navbar otherwise. Keeping the choice here means the
 * header can never disagree with the user's auth state from one page to the
 * next, and server pages can use it without themselves becoming client
 * components.
 */
export default function SiteHeader({
  showAuth = 'both',
}: {
  showAuth?: 'login' | 'signup' | 'both'
}) {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setLoggedIn(!!getUser())
  }, [])

  return loggedIn ? <AppNav /> : <Navbar showAuth={showAuth} />
}
