'use client'

import { useEffect, useRef } from 'react'
import { HERO_BLACK_PATH, HERO_BLUE_PATHS, HERO_DEST } from '@/lib/heroRoute'

/**
 * Illustrated city-map hero. The static map + location dots live in
 * public/hero-map.svg (viewBox 0 110 448 560). The route, the car and the
 * destination are driven by a single requestAnimationFrame loop so the car
 * stays locked to the drawing tip. Loop: a car drives the black route from the
 * location to the destination (drawing it, blue feeders joining as it passes);
 * on arrival the line vanishes and the star appears for a 7s hold; then a fresh
 * line draws from the destination back to the origin (reconnecting the blue
 * dots) and vanishes on arrival, restarting the loop.
 */
const FORWARD = 4.5
const HOLD = 7
const RETURN = 4.5
const GAP = 0.6
const LOOP = FORWARD + HOLD + RETURN + GAP
const WIN = 0.13 // how quickly each blue feeder snaps in as the line passes it

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

/** Round avatar: shows the photo, falling back to initials if it fails to load. */
function Avatar({ src, initials, className }: { src: string; initials: string; className: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center overflow-hidden rounded-full ${className}`}>
      <span>{initials}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
    </span>
  )
}

export default function HeroMap() {
  const blackRef = useRef<SVGPathElement>(null)
  const blueRefs = useRef<(SVGPathElement | null)[]>([])
  const carRef = useRef<SVGGElement>(null)
  const starRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const black = blackRef.current
    const car = carRef.current
    const star = starRef.current
    if (!black || !car || !star) return

    const blackLen = black.getTotalLength()
    black.style.strokeDasharray = `${blackLen}`

    // Per-blue: total length + the fraction along the black route where it joins.
    const blues = HERO_BLUE_PATHS.map((_, i) => {
      const el = blueRefs.current[i]!
      const len = el.getTotalLength()
      el.style.strokeDasharray = `${len}`
      const end = el.getPointAtLength(len) // the connecting end touches the black line
      let best = 0, bestD = Infinity
      for (let s = 0; s <= 240; s++) {
        const L = (s / 240) * blackLen
        const p = black.getPointAtLength(L)
        const d = (p.x - end.x) ** 2 + (p.y - end.y) ** 2
        if (d < bestD) { bestD = d; best = L }
      }
      return { el, len, meet: best / blackLen }
    })

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Show/hide the route lines as a whole (they vanish at each journey's end).
    const showLines = (v: boolean) => {
      black.style.opacity = v ? '1' : '0'
      for (const b of blues) b.el.style.opacity = v ? '1' : '0'
    }

    // Draw the black line growing from the origin (forward). p = revealed fraction.
    const drawForward = (p: number) => {
      black.style.strokeDashoffset = `${blackLen * (1 - p)}`
      for (const b of blues) {
        const bp = clamp((p - (b.meet - WIN)) / WIN, 0, 1)
        b.el.style.strokeDashoffset = `${b.len * (1 - bp)}`
      }
    }

    // Draw a fresh black line growing from the destination back toward the origin.
    // q = return progress; the frontier reaches origin distance (1 - q).
    const drawReturn = (q: number) => {
      black.style.strokeDashoffset = `${-blackLen * (1 - q)}`
      const r = 1 - q
      for (const b of blues) {
        const bp = clamp((b.meet - r) / WIN + 1, 0, 1)
        b.el.style.strokeDashoffset = `${b.len * (1 - bp)}`
      }
    }

    const placeCar = (frac: number, backward: boolean) => {
      const l = clamp(blackLen * frac, 0, blackLen)
      const a = black.getPointAtLength(clamp(l - 0.6, 0, blackLen))
      const b = black.getPointAtLength(clamp(l + 0.6, 0, blackLen))
      const pt = black.getPointAtLength(l)
      let ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
      if (backward) ang += 180
      car.setAttribute('transform', `translate(${pt.x} ${pt.y}) rotate(${ang})`)
    }

    if (reduce) {
      showLines(true)
      drawForward(1)
      car.style.opacity = '0'
      star.style.opacity = '1'
      return
    }

    let raf = 0
    let t0 = 0
    const frame = (t: number) => {
      if (!t0) t0 = t
      const m = ((t - t0) / 1000) % LOOP

      if (m < FORWARD) {
        // drive origin -> destination, drawing the line
        const p = m / FORWARD
        showLines(true)
        drawForward(p)
        placeCar(p, false)
        car.style.opacity = p < 0.96 ? '1' : '0'   // arrive and vanish
        star.style.opacity = '0'
      } else if (m < FORWARD + HOLD) {
        // at the destination: line gone, star shows and holds
        showLines(false)
        car.style.opacity = '0'
        star.style.opacity = '1'
      } else if (m < FORWARD + HOLD + RETURN) {
        // a new line draws from the destination back to the origin
        const q = (m - FORWARD - HOLD) / RETURN
        showLines(true)
        drawReturn(q)
        placeCar(1 - q, true)
        car.style.opacity = q < 0.96 ? '1' : '0'   // reach origin and vanish
        star.style.opacity = '0'
      } else {
        // brief reset before the loop restarts
        showLines(false)
        car.style.opacity = '0'
        star.style.opacity = '0'
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="relative w-full max-w-[520px]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] ring-1 ring-black/5 shadow-[0_40px_90px_-50px_rgba(20,24,60,0.35)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero-map.svg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />

        <svg viewBox="0 110 448 560" className="absolute inset-0 h-full w-full" aria-hidden>
          {/* blue feeders */}
          {HERO_BLUE_PATHS.map((b, i) => (
            <path
              key={i}
              ref={(el) => { blueRefs.current[i] = el }}
              d={b.d}
              fill="none"
              stroke="#2563eb"
              strokeWidth={4.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
            />
          ))}

          {/* black route */}
          <path
            ref={blackRef}
            d={HERO_BLACK_PATH}
            fill="none"
            stroke="#112129"
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
          />

          {/* car (top-down, drawn pointing east; the loop rotates it to the road) */}
          <g ref={carRef} style={{ opacity: 0 }}>
            <rect x={-9} y={-5} width={18} height={10} rx={3.5} fill="#112129" />
            <rect x={1.5} y={-3.6} width={4.6} height={7.2} rx={1.4} fill="#9cc3ff" />
            <rect x={-6.5} y={-3.6} width={3.6} height={7.2} rx={1.3} fill="#3b4a63" />
          </g>

          {/* destination star (+ ping ring) */}
          <g ref={starRef} style={{ opacity: 0 }}>
            <circle className="hm-ping" cx={HERO_DEST.x} cy={HERO_DEST.y} r={16} fill="#f90d3b" opacity={0.25} />
            <circle cx={HERO_DEST.x} cy={HERO_DEST.y} r={16} fill="#fff" />
            <circle cx={HERO_DEST.x} cy={HERO_DEST.y} r={12.5} fill="#f90d3b" />
            <path transform={`translate(${HERO_DEST.x} ${HERO_DEST.y})`} d="M0 -9 L2 -2.8 L8.6 -2.8 L3.3 1.1 L5.3 7.3 L0 3.4 L-5.3 7.3 L-3.3 1.1 L-8.6 -2.8 L-2 -2.8 Z" fill="#fff" />
          </g>
        </svg>

        {/* top label */}
        <div className="absolute left-5 top-5 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-[#5b6486] backdrop-blur">
          RIVERSIDE · SATURDAY 2:00 PM
        </div>

        {/* neighbours pill */}
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-[0_10px_30px_-12px_rgba(20,24,60,0.4)]">
          <span className="flex -space-x-2">
            <Avatar src="/avatars/neighbour-1.jpg" initials="K" className="h-5 w-5 bg-[#cdd7f6] text-[9px] font-bold text-[#2563eb] ring-2 ring-white" />
            <Avatar src="/avatars/neighbour-2.jpg" initials="T" className="h-5 w-5 bg-[#f6d9c9] text-[9px] font-bold text-[#c2410c] ring-2 ring-white" />
          </span>
          <span className="text-xs font-semibold text-[#0a0a23]">+2 neighbours going</span>
        </div>

        {/* match card */}
        <div className="absolute bottom-4 left-4 flex max-w-[64%] items-center gap-3 rounded-2xl bg-white px-3.5 py-3 shadow-[0_20px_50px_-20px_rgba(20,24,60,0.45)]">
          <Avatar src="/avatars/amara.jpg" initials="AO" className="h-10 w-10 shrink-0 bg-[#0a0a23] text-xs font-bold text-white" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-[#0a0a23]">Amara O.</span>
            <span className="block truncate text-xs text-[#5b6486]">Driving to Riverside Hall</span>
          </span>
          <span className="shrink-0 rounded-md bg-[#e6edff] px-2 py-1 text-[10px] font-bold tracking-wide text-[#2563eb]">3 seats</span>
        </div>
      </div>

      <style jsx>{`
        .hm-ping {
          transform-box: fill-box;
          transform-origin: center;
          animation: hm-ping 2.2s ease-out infinite;
        }
        @keyframes hm-ping {
          0% { transform: scale(0.7); opacity: 0.35; }
          80%, 100% { transform: scale(1.9); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hm-ping { animation: none; opacity: 0; }
        }
      `}</style>
    </div>
  )
}
