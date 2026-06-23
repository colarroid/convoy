'use client'

import { useEffect, useState } from 'react'
import { HERO_BLACK_PATH, HERO_BLUE_PATHS, HERO_DEST } from '@/lib/heroRoute'

/**
 * Illustrated city-map hero. The static map + location dots live in
 * public/hero-map.svg (viewBox 0 110 448 560). The routes, the moving car and
 * the destination are animated overlays so we can time them: a car drives the
 * black route from the location to the destination (drawing it as it goes),
 * each blue feeder draws to meet the black line at its intersection, and the
 * destination star only appears once the car arrives.
 */
const BLACK_DUR = 4.5     // slow + dramatic
const BLACK_DELAY = 0.4
const OLD_BLACK_DUR = 2.4 // the blue feeder timings were calibrated against this
const RATIO = BLACK_DUR / OLD_BLACK_DUR
const DEST_AT = BLACK_DELAY + BLACK_DUR

export default function HeroMap() {
  const [animate, setAnimate] = useState(false)
  useEffect(() => {
    setAnimate(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  return (
    <div className="relative w-full max-w-[520px]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] ring-1 ring-black/5 shadow-[0_40px_90px_-50px_rgba(20,24,60,0.35)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero-map.svg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />

        {/* animated routes + car + destination, aligned to the map viewBox */}
        <svg viewBox="0 110 448 560" className="absolute inset-0 h-full w-full" aria-hidden>
          {/* blue feeders draw to meet the black route at their intersections */}
          {HERO_BLUE_PATHS.map((b, i) => (
            <path
              key={i}
              className="hm-line"
              style={{ animationDuration: `${b.dur * RATIO}s`, animationDelay: `${BLACK_DELAY + (b.delay - 0.3) * RATIO}s` }}
              d={b.d}
              pathLength={1}
              fill="none"
              stroke="#2563eb"
              strokeWidth={4.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* black route: location -> destination */}
          <path
            id="hm-black"
            className="hm-line"
            style={{ animationDuration: `${BLACK_DUR}s`, animationDelay: `${BLACK_DELAY}s` }}
            d={HERO_BLACK_PATH}
            pathLength={1}
            fill="none"
            stroke="#112129"
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* car driving the black route, hidden until it starts and after it arrives */}
          {animate && (
            <g opacity={0}>
              {/* top-down car, pointing east (rotate=auto orients it along travel) */}
              <g>
                <rect x={-9} y={-5} width={18} height={10} rx={3.5} fill="#112129" />
                <rect x={1.5} y={-3.6} width={4.6} height={7.2} rx={1.4} fill="#9cc3ff" />
                <rect x={-6.5} y={-3.6} width={3.6} height={7.2} rx={1.3} fill="#3b4a63" />
              </g>
              <animateMotion begin={`${BLACK_DELAY}s`} dur={`${BLACK_DUR}s`} rotate="auto" fill="freeze">
                <mpath href="#hm-black" />
              </animateMotion>
              <set attributeName="opacity" to="1" begin={`${BLACK_DELAY}s`} />
              <set attributeName="opacity" to="0" begin={`${DEST_AT}s`} />
            </g>
          )}

          {/* destination star, revealed after the car arrives */}
          <g className="hm-dest" style={{ animationDelay: `${DEST_AT}s` }}>
            <circle cx={HERO_DEST.x} cy={HERO_DEST.y} r={16} fill="#fff" />
            <circle cx={HERO_DEST.x} cy={HERO_DEST.y} r={12.5} fill="#f90d3b" />
            <path transform={`translate(${HERO_DEST.x} ${HERO_DEST.y})`} d="M0 -9 L2 -2.8 L8.6 -2.8 L3.3 1.1 L5.3 7.3 L0 3.4 L-5.3 7.3 L-3.3 1.1 L-8.6 -2.8 L-2 -2.8 Z" fill="#fff" />
          </g>
        </svg>

        {/* gentle pulse on the destination, after it appears */}
        <span className="hm-pulse pointer-events-none absolute block h-12 w-12 rounded-full" style={{ left: '79%', top: '81.3%', animationDelay: `${DEST_AT + 0.2}s` }} />

        {/* top label */}
        <div className="absolute left-5 top-5 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-[#5b6486] backdrop-blur">
          RIVERSIDE · SUNDAY 8:40
        </div>

        {/* neighbours pill */}
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-[0_10px_30px_-12px_rgba(20,24,60,0.4)]">
          <span className="flex -space-x-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#cdd7f6] text-[9px] font-bold text-[#2563eb] ring-2 ring-white">K</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f6d9c9] text-[9px] font-bold text-[#c2410c] ring-2 ring-white">T</span>
          </span>
          <span className="text-xs font-semibold text-[#0a0a23]">+2 neighbours going</span>
        </div>

        {/* match card (bottom-left, kept clear of the destination star on the right) */}
        <div className="absolute bottom-4 left-4 flex max-w-[64%] items-center gap-3 rounded-2xl bg-white px-3.5 py-3 shadow-[0_20px_50px_-20px_rgba(20,24,60,0.45)]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0a0a23] text-xs font-bold text-white">AO</span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-[#0a0a23]">Amara O.</span>
            <span className="block truncate text-xs text-[#5b6486]">Driving to Riverside Hall · 3 seats</span>
          </span>
          <span className="rounded-md bg-[#e6edff] px-2 py-1 text-[10px] font-bold tracking-wide text-[#2563eb]">MATCH</span>
        </div>
      </div>

      <style jsx>{`
        .hm-line {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: hm-draw 2s linear 0s forwards;
        }
        @keyframes hm-draw { to { stroke-dashoffset: 0; } }

        .hm-dest {
          transform-box: fill-box;
          transform-origin: center;
          opacity: 0;
          animation: hm-pop 0.5s ease-out both;
        }
        @keyframes hm-pop {
          0% { opacity: 0; transform: scale(0.3); }
          70% { opacity: 1; transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1); }
        }

        .hm-pulse {
          opacity: 0;
          transform: translate(-50%, -50%);
          background: rgba(249, 13, 59, 0.22);
          animation: hm-pulse 2.4s ease-in-out infinite;
        }
        @keyframes hm-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(0.7); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hm-line { animation: none !important; stroke-dashoffset: 0; }
          .hm-dest { animation: none; opacity: 1; }
          .hm-pulse { animation: none; opacity: 0; }
        }
      `}</style>
    </div>
  )
}
