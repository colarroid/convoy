'use client'

import { useState, useEffect } from 'react'

const KEY = 'veesaa_cookie_notice_dismissed'

export default function CookieNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setVisible(true)
  }, [])

  const dismiss = () => {
    localStorage.setItem(KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <div className="max-w-lg mx-auto bg-black text-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-xl pointer-events-auto
                      animate-in slide-in-from-bottom-4 duration-300">
        <span className="text-xl shrink-0">🍪</span>

        <p className="flex-1 text-xs text-gray-300 leading-relaxed">
          We use local storage to keep you signed in and save your ride preferences.{' '}
          <span className="text-white font-medium">No tracking, no ads, ever.</span>
        </p>

        <button
          onClick={dismiss}
          className="shrink-0 px-3.5 py-1.5 bg-white text-black text-xs font-bold rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
