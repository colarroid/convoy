'use client'

import { useEffect, useRef, useState } from 'react'

const TEXT =
  'Every day, people living near each other head to the same gathering but travel separately. Veesaa connects them so they can get there together. Lift-sharing built around shared destinations and trusted communities.'
const WORDS = TEXT.split(' ')

/** Landing manifesto that auto-fills word by word (like someone reading) once in view. */
export default function ManifestoSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(0)
  const [started, setStarted] = useState(false)

  // Start the reading animation the first time the section scrolls into view.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true)
          obs.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Fill one word after another at a steady reading pace.
  useEffect(() => {
    if (!started) return
    const id = setInterval(() => {
      setRevealed((n) => {
        if (n >= WORDS.length) { clearInterval(id); return n }
        return n + 1
      })
    }, 220)
    return () => clearInterval(id)
  }, [started])

  return (
    <section ref={ref} className="bg-black text-white py-24 md:py-40 px-5 md:px-8">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-bold tracking-[0.25em] text-gray-600 uppercase mb-10">Why Veesaa</p>
        <p className="text-[26px] leading-[1.35] md:text-[40px] md:leading-[1.3] font-bold tracking-tight">
          {WORDS.map((w, i) => (
            <span
              key={i}
              style={{ color: i < revealed ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.16)' }}
              className="transition-colors duration-300"
            >
              {w}{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
