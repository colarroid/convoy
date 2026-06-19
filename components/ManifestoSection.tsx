'use client'

import { useEffect, useRef, useState } from 'react'

const TEXT =
  'Every day, people living near each other head to the same gathering but travel separately. Veesaa connects them so they can get there together. Lift-sharing built around shared destinations and trusted communities.'
const WORDS = TEXT.split(' ')

/** Landing manifesto whose words fill (dim to bright) as the section scrolls through view. */
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
      // Map the section's travel through the viewport to 0..1.
      const start = vh * 0.85   // begins filling when the top reaches 85% down
      const end = vh * 0.25     // fully filled when the top reaches 25% down
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

  // How many words are "lit" given the current scroll progress (with a soft edge).
  const revealed = progress * (WORDS.length + 2)

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
