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

        {/* Scroll indicator: fill progress + hint, fades away once the reveal completes */}
        <div
          className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 transition-opacity duration-500"
          style={{ opacity: progress > 0.92 ? 0 : 1 }}
        >
          <div className="h-[3px] w-28 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${Math.min(100, (progress / 0.85) * 100)}%` }}
            />
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
            Scroll
            <svg className="h-3 w-3 animate-bounce" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      </div>
    </section>
  )
}
