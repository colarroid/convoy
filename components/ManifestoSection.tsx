'use client'

import { useEffect, useRef, useState } from 'react'

const TEXT =
  'Every day, people living near each other head to the same gathering but travel separately. Veesaa connects them so they can get there together. Lift-sharing built around shared destinations and trusted communities.'
const WORDS = TEXT.split(' ')

/** Landing manifesto whose words fill (dim to bright) as the section scrolls through view. */
export default function ManifestoSection() {
  const ref = useRef<HTMLParagraphElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      // Fill as the paragraph rises: 0 when its top sits near the bottom of the
      // viewport, 1 by the time its top passes the upper third.
      const start = vh * 0.9
      const end = vh * 0.3
      const p = (start - rect.top) / (start - end)
      setProgress(Math.max(0, Math.min(1, p)))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    // Run a couple of times after mount in case layout/fonts settle late.
    update()
    const t = setTimeout(update, 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      clearTimeout(t)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Number of words "lit", with a soft leading edge so it reads word by word.
  const revealed = progress * (WORDS.length + 3)

  return (
    <section className="bg-black text-white py-24 md:py-40 px-5 md:px-8">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-bold tracking-[0.25em] text-gray-600 uppercase mb-10">Why Veesaa</p>
        <p ref={ref} className="text-[26px] leading-[1.35] md:text-[40px] md:leading-[1.3] font-bold tracking-tight">
          {WORDS.map((w, i) => {
            const op = Math.max(0, Math.min(1, revealed - i))
            return (
              <span key={i} style={{ color: `rgba(255,255,255,${0.18 + 0.82 * op})` }}>
                {w}{' '}
              </span>
            )
          })}
        </p>
      </div>
    </section>
  )
}
