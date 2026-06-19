'use client'

import { useEffect, useRef, useState } from 'react'

const TEXT =
  'Every day, people from the same community head to the same place at the same time — and travel separately. Veesaa connects them, so they go together. The destination is the point, not the fare. No charges. No strangers. Just your community, getting there together.'
const WORDS = TEXT.split(' ')

/** Landing manifesto with a scroll-linked word reveal (dim → bright). */
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
      const start = vh * 0.85   // begins revealing as it enters
      const end = vh * 0.30     // fully revealed once near the middle
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
      </div>
    </section>
  )
}
