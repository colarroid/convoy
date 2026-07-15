'use client'

import { useEffect, useState } from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any */

const DISMISS_KEY = 'veesaa_install_dismissed'

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [isIosSafari, setIsIosSafari] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(DISMISS_KEY)) return
    // Already installed / running standalone?
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) return
    // Don't stack on top of the cookie notice, wait until it's dismissed.
    if (!localStorage.getItem('veesaa_cookie_notice_dismissed')) return

    const ua = navigator.userAgent
    const isIos = /iphone|ipad|ipod/i.test(ua) && !(window as any).MSStream
    const isSafari = /safari/i.test(ua) && !/crios|fxios|android/i.test(ua)
    if (isIos && isSafari) {
      setIsIosSafari(true)
      setShow(true)
      return
    }

    const handler = (e: any) => {
      e.preventDefault()
      setDeferred(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    setShow(false)
    localStorage.setItem(DISMISS_KEY, '1')
  }

  const install = async () => {
    if (!deferred) return
    deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    setShow(false)
    localStorage.setItem(DISMISS_KEY, '1')
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <div className="max-w-lg mx-auto bg-black text-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-xl pointer-events-auto animate-slide-up">
        <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-bold text-sm shrink-0">C</div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">Install Veesaa</p>
          <p className="text-xs text-gray-300 leading-snug mt-0.5">
            {isIosSafari
              ? 'Tap the Share icon, then “Add to Home Screen”.'
              : 'Add it to your home screen for quick access.'}
          </p>
        </div>

        {isIosSafari ? (
          <button onClick={dismiss} className="shrink-0 px-3 py-1.5 text-xs font-bold text-gray-300 hover:text-white transition-colors">
            Got it
          </button>
        ) : (
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={dismiss} className="px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors">
              Not now
            </button>
            <button onClick={install} className="px-3.5 py-1.5 bg-white text-black text-xs font-bold rounded-xl hover:bg-gray-100 active:scale-95 transition-all">
              Install
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
