'use client'

import { useEffect, useRef, useState } from 'react'

const TEXT =
  'Every day, people living near each other head to the same gathering but travel separately. Veesaa connects them so they can get there together. Lift-sharing built around shared destinations and trusted communities.'
const WORDS = TEXT.split(' ')

/**
 * Scroll-pinned manifesto: a tall (200vh) section whose inner panel sticks to
 * the viewport at full height. As you scroll through it the words fill from dim
 * to bright; once the fill completes the panel unpins and the page scrolls on.
 */
export default function ManifestoSection() {
  const ref = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const scrollable = rect.height - vh // how far the panel stays pinned
      const p = scrollable > 0 ? -rect.top / scrollable : 0
      setProgress(Math.max(0, Math.min(1, p)))
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

  // Finish filling a little before the panel unpins so the last word isn't rushed.
  const revealed = Math.min(1, progress / 0.85) * (WORDS.length + 2)

  return (
    <section ref={ref} className="relative bg-black text-white" style={{ height: '200vh' }}>
      <div className="sticky top-0 flex h-screen items-center px-5 md:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="mb-10 text-xs font-bold uppercase tracking-[0.25em] text-gray-600">Why Veesaa</p>
          <p className="text-[26px] font-bold leading-[1.35] tracking-tight md:text-[40px] md:leading-[1.3]">
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
      </div>
    </section>
  )
}
