'use client'

import { useEffect, useRef } from 'react'
import { HERO_BLACK_PATH, HERO_BLUE_PATHS, HERO_DEST } from '@/lib/heroRoute'

/**
 * Illustrated city-map hero. The static map + location dots live in
 * public/hero-map.svg (viewBox 0 110 448 560). The route, the car and the
 * destination are driven by a single requestAnimationFrame loop so the car
 * stays locked to the drawing tip. Loop: a car drives the black route from the
 * location to the destination, pausing at each pickup while that rider's blue
 * feeder draws in to meet it, then continuing;
 * on arrival the star appears and the line stays for a 7s hold; when the return
 * starts the forward line vanishes and a fresh line draws from the destination
 * back to the origin (blue feeders now linking from the line back to their dot)
 * while the star stays up; the return line vanishes on arrival, restarting.
 */
const FORWARD = 9
const HOLD = 7
const RETURN = 7.5
const GAP = 0.6
const LOOP = FORWARD + HOLD + RETURN + GAP
const WIN = 0.13 // how quickly each blue feeder snaps in as the return line passes it

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

    // Start fully hidden so nothing flashes before the first animation frame.
    black.style.strokeDashoffset = `${blackLen}`
    for (const b of blues) b.el.style.strokeDashoffset = `${b.len}`

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Show/hide the route lines as a whole (they vanish at each journey's end).
    const showLines = (v: boolean) => {
      black.style.opacity = v ? '1' : '0'
      for (const b of blues) b.el.style.opacity = v ? '1' : '0'
    }

    // Forward leg: the car drives, then pauses at each blue intersection while
    // that rider's feeder draws in to meet it, then continues to the destination.
    const PAUSE = 0.6
    const sorted = blues.map((b, i) => ({ i, meet: b.meet })).sort((a, b) => a.meet - b.meet)
    const driveTime = FORWARD - PAUSE * sorted.length
    type Seg = { drive: boolean; from: number; to: number; blue: number; t0: number; t1: number }
    const segs: Seg[] = []
    {
      let prev = 0, acc = 0
      for (const s of sorted) {
        const dur = (s.meet - prev) * driveTime
        segs.push({ drive: true, from: prev, to: s.meet, blue: -1, t0: acc, t1: acc + dur }); acc += dur
        segs.push({ drive: false, from: s.meet, to: s.meet, blue: s.i, t0: acc, t1: acc + PAUSE }); acc += PAUSE
        prev = s.meet
      }
      const dur = (1 - prev) * driveTime
      segs.push({ drive: true, from: prev, to: 1, blue: -1, t0: acc, t1: acc + dur })
    }

    // Apply the forward timeline at time t (within the forward leg); returns the
    // black progress so the car can be placed on the tip.
    const drawForward = (t: number) => {
      let p = 0
      const bP = blues.map(() => 0)
      for (const s of segs) {
        if (t >= s.t1) { if (s.drive) p = s.to; else bP[s.blue] = 1; continue }
        const local = (t - s.t0) / (s.t1 - s.t0)
        if (s.drive) p = s.from + (s.to - s.from) * local
        else { p = s.from; bP[s.blue] = clamp(local / 0.8, 0, 1) } // feeder draws in during the pause
        break
      }
      black.style.strokeDashoffset = `${blackLen * (1 - p)}`
      blues.forEach((b, i) => { b.el.style.strokeDashoffset = `${b.len * (1 - bP[i])}` })
      return p
    }

    const drawFull = () => {
      black.style.strokeDashoffset = '0'
      for (const b of blues) b.el.style.strokeDashoffset = '0'
    }

    // Draw a fresh black line growing from the destination back toward the origin.
    // q = return progress; the frontier reaches origin distance (1 - q). The blue
    // feeders draw the other way now: from the black line back to their dot.
    const drawReturn = (q: number) => {
      black.style.strokeDashoffset = `${-blackLen * (1 - q)}`
      const r = 1 - q
      for (const b of blues) {
        // only start once the returning line has reached this intersection
        const bp = clamp((b.meet - r) / WIN, 0, 1)
        b.el.style.strokeDashoffset = `${-b.len * (1 - bp)}`
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
      drawFull()
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
        // drive origin -> destination, pausing at each pickup for its feeder
        showLines(true)
        const p = drawForward(m)
        placeCar(p, false)
        car.style.opacity = p < 0.96 ? '1' : '0'   // arrive and vanish
        star.style.opacity = '0'
      } else if (m < FORWARD + HOLD) {
        // at the destination: the forward line stays, star shows and holds
        showLines(true)
        drawFull()
        car.style.opacity = '0'
        star.style.opacity = '1'
      } else if (m < FORWARD + HOLD + RETURN) {
        // the forward line vanishes and a fresh line draws back to the origin;
        // the destination star stays up through the whole return
        const q = (m - FORWARD - HOLD) / RETURN
        showLines(true)
        drawReturn(q)
        placeCar(1 - q, true)
        car.style.opacity = q < 0.96 ? '1' : '0'   // reach origin and vanish
        star.style.opacity = '1'
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
    // Width is capped by height too, so the portrait card never taller than the screen.
    <div className="relative mx-auto xl:mr-0 w-full max-w-[min(520px,calc((100vh-9rem)*0.8))]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] ring-1 ring-black/[0.06] shadow-[0_48px_100px_-48px_rgba(20,24,60,0.45)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero-map.svg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />

        <svg viewBox="0 110 448 560" className="absolute inset-0 h-full w-full" aria-hidden>
          {/* soft pings on the pickup locations */}
          {[
            { x: 176.26, y: 256.22, c: '#112129', d: 0 },
            { x: 62.1, y: 289.66, c: '#2563eb', d: 0.9 },
            { x: 95.72, y: 179.79, c: '#2563eb', d: 1.8 },
          ].map((p, i) => (
            <circle
              key={i}
              className="hm-dotping"
              style={{ animationDelay: `${p.d}s` }}
              cx={p.x}
              cy={p.y}
              r={15}
              fill={p.c}
              opacity={0.18}
            />
          ))}

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
            style={{ strokeDasharray: 1, strokeDashoffset: 1, filter: 'drop-shadow(0 2px 3px rgba(17,33,41,0.35))' }}
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
          <span className="text-xs font-semibold text-[#0a0a23]">
            <span className="md:hidden">+2</span>
            <span className="hidden md:inline">+2 neighbours going</span>
          </span>
        </div>

        {/* match card */}
        <div className="absolute bottom-4 left-4 flex max-w-[64%] items-center gap-3 rounded-2xl bg-white px-3.5 py-3 shadow-[0_20px_50px_-20px_rgba(20,24,60,0.45)]">
          <Avatar src="/avatars/amara.jpg" initials="AO" className="h-10 w-10 shrink-0 bg-[#0a0a23] text-xs font-bold text-white" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-[#0a0a23]">Amara O.</span>
            <span className="block truncate text-xs text-[#5b6486]">Driving to Riverside Hall</span>
          </span>
          <span className="shrink-0 rounded-md bg-[#e6edff] px-2 py-1 text-[10px] font-bold tracking-wide text-[#2563eb]">13.5 km</span>
        </div>
      </div>

      <style jsx>{`
        .hm-dotping {
          transform-box: fill-box;
          transform-origin: center;
          animation: hm-dotping 2.8s ease-out infinite;
        }
        @keyframes hm-dotping {
          0% { transform: scale(0.45); opacity: 0.3; }
          75%, 100% { transform: scale(1.7); opacity: 0; }
        }
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
          .hm-ping, .hm-dotping { animation: none; opacity: 0; }
        }
      `}</style>
    </div>
  )
}
