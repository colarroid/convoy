'use client'

/**
 * Illustrated city-map hero. Background is the cleaned street map
 * (public/hero-map.svg, viewBox 0 0 750 500). The route is traced along the
 * map's yellow arterials: the black pickup follows the yellow roads all the way
 * to the starred destination, and the two blue pickups link onto the black line
 * (one from the eastern arterial, one down the north-west arterial).
 *
 * We frame the window x:60..560 (a square) so the route sits comfortably.
 */

const BLACK = 'M214 415 L218 330 L219 262 L205 200 L198 150 L197 124'  // up the yellow arterial to the star
const BLUE_1 = 'M390 192 L300 184 L240 178 L203 172'                   // eastern arterial, taps black at (203,172)
const BLUE_2 = 'M95 30 L140 70 L178 105 L201 142'                      // NW arterial, taps black at (201,142)

export default function HeroMap() {
  return (
    <div className="relative w-full max-w-[640px]">
      <div className="relative aspect-square overflow-hidden rounded-[28px] ring-1 ring-black/5 shadow-[0_40px_90px_-50px_rgba(20,24,60,0.35)]">
        {/* map background, framed to the route window */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero-map.svg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '24% 50%' }} />

        {/* route + markers, aligned to the same window */}
        <svg viewBox="60 0 500 500" className="absolute inset-0 h-full w-full" role="img" aria-label="Neighbours routed along the roads to a shared destination">
          <path className="hm-route hm-route-dark" d={BLACK} fill="none" stroke="#0a0a23" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path className="hm-route hm-route-blueA" d={BLUE_1} fill="none" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path className="hm-route hm-route-blueB" d={BLUE_2} fill="none" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

          {/* tap points where the blues link onto the black route */}
          <g className="hm-node hm-node-jA"><circle cx="203" cy="172" r="6" fill="#fff" /><circle cx="203" cy="172" r="3" fill="#2563eb" /></g>
          <g className="hm-node hm-node-jB"><circle cx="201" cy="142" r="6" fill="#fff" /><circle cx="201" cy="142" r="3" fill="#2563eb" /></g>

          {/* pickups */}
          <g className="hm-node"><circle cx="214" cy="415" r="12" fill="#fff" /><circle cx="214" cy="415" r="5.5" fill="#0a0a23" /></g>
          <g className="hm-node hm-node-2"><circle cx="390" cy="192" r="12" fill="#fff" /><circle cx="390" cy="192" r="5.5" fill="#2563eb" /></g>
          <g className="hm-node hm-node-3"><circle cx="95" cy="30" r="12" fill="#fff" /><circle cx="95" cy="30" r="5.5" fill="#2563eb" /></g>

          {/* destination star */}
          <g className="hm-dest">
            <circle className="hm-dest-pulse" cx="197" cy="124" r="26" fill="#2563eb" opacity="0.18" />
            <circle cx="197" cy="124" r="17" fill="#2563eb" />
            <path d="M197 115 l2.6 5.3 5.8 0.85 -4.2 4.1 1 5.8 -5.2 -2.75 -5.2 2.75 1 -5.8 -4.2 -4.1 5.8 -0.85 z" fill="#fff" />
          </g>
        </svg>

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

        {/* match card */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3 shadow-[0_20px_50px_-20px_rgba(20,24,60,0.45)]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0a0a23] text-xs font-bold text-white">AO</span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-[#0a0a23]">Amara O.</span>
            <span className="block truncate text-xs text-[#5b6486]">Driving to Riverside Hall · 3 seats</span>
          </span>
          <span className="rounded-md bg-[#e6edff] px-2 py-1 text-[10px] font-bold tracking-wide text-[#2563eb]">MATCH</span>
        </div>
      </div>

      <style jsx>{`
        .hm-route { stroke-dasharray: 600; stroke-dashoffset: 600; animation: hm-draw 2s ease-out forwards; }
        .hm-route-dark  { animation-delay: 0s; }
        .hm-route-blueA { animation-delay: 1.5s; }
        .hm-route-blueB { animation-delay: 2.1s; }
        @keyframes hm-draw { to { stroke-dashoffset: 0; } }

        .hm-node { transform-box: fill-box; transform-origin: center; animation: hm-pop 0.5s ease-out both; }
        .hm-node-2 { animation-delay: 0.4s; }
        .hm-node-3 { animation-delay: 0.8s; }
        .hm-node-jA { animation-delay: 2s; }
        .hm-node-jB { animation-delay: 2.6s; }
        @keyframes hm-pop {
          0% { opacity: 0; transform: scale(0.4); }
          70% { transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }

        .hm-dest { transform-box: fill-box; transform-origin: 197px 124px; }
        .hm-dest-pulse { animation: hm-pulse 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        @keyframes hm-pulse {
          0%, 100% { transform: scale(0.85); opacity: 0.25; }
          50% { transform: scale(1.25); opacity: 0.05; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hm-route, .hm-node { animation: none; stroke-dashoffset: 0; opacity: 1; transform: none; }
          .hm-dest-pulse { animation: none; }
        }
      `}</style>
    </div>
  )
}
