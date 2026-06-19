'use client'

import { useEffect, useRef, useState } from 'react'

const TEXT =
  'Every day, people living near each other head to the same gathering but travel separately. Veesaa connects them so they can get there together. Lift-sharing built around shared destinations and trusted communities.'
const WORDS = TEXT.split(' ')

/** Landing manifesto with a scroll-linked word reveal (dim to bright). */
export default function ManifestoSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const start = vh * 0.85
      const end = vh * 0.30
      setProgress(Math.max(0, Math.min(1, (start - rect.top) / (start - end))))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const revealed = progress * (WORDS.length + 4)

  return (
    <section ref={ref} className="bg-black text-white py-24 md:py-40 px-5 md:px-8">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-bold tracking-[0.25em] text-gray-600 uppercase mb-10">Why Veesaa</p>
        <p className="text-[26px] leading-[1.35] md:text-[40px] md:leading-[1.3] font-bold tracking-tight">
          {WORDS.map((w, i) => {
            const op = Math.max(0, Math.min(1, revealed - i))
            return (
              <span key={i} style={{ color: `rgba(255,255,255,${0.16 + 0.84 * op})` }}>
                {w}{' '}
              </span>
            )
          })}
        </p>
        <p className="mt-12 md:mt-16 text-4xl md:text-6xl font-extrabold tracking-tight">
          No charges.{' '}
          <span className="bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">No strangers.</span>
        </p>
      </div>
    </section>
  )
}
