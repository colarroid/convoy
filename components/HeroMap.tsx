'use client'

/**
 * Illustrated city-map hero. The background is a cleaned street-grid map
 * (public/hero-map.svg). On top, a route is drawn ALONG the map's main roads:
 * the black pickup follows 140 Street then 88 Avenue to the starred
 * destination, and the two blue pickups link onto that route at the junction
 * and follow 88 Avenue the rest of the way.
 *
 * Map viewBox is 0 0 750 500. Grid from the original labels:
 *   vertical streets  x = 85 (140) / 259 (144) / 430 (148) / 600 (152)
 *   horizontal avenues y = 205 (88) / 379 (84)
 */

// Square crop shows the central band (x ~ 125..625), so the route lives there.
// Black leads from its pickup along the roads to the star. The blues tap onto
// the black route at real intersections it passes, then ride it to the star.
const BLACK = 'M600 379 L600 205 L259 205'        // 152 St up, 88 Ave west to star (passes 430,205)
const BLUE_1 = 'M430 379 L430 205 L259 205'       // 148 St up, joins black at (430,205), on to star
const BLUE_2 = 'M259 379 L259 205'                // 144 St up, joins black at the star

export default function HeroMap() {
  return (
    <div className="relative w-full max-w-[640px]">
      <div className="relative aspect-square overflow-hidden rounded-[28px] ring-1 ring-black/5 shadow-[0_40px_90px_-50px_rgba(20,24,60,0.35)]">
        {/* map background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero-map.svg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />

        {/* route + markers overlay, aligned to the map's viewBox */}
        <svg viewBox="0 0 750 500" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" role="img" aria-label="Neighbours routed along the main roads to a shared destination">
          {/* the route, running along the roads */}
          <path className="hm-route hm-route-dark" d={BLACK} fill="none" stroke="#0a0a23" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path className="hm-route hm-route-blueA" d={BLUE_1} fill="none" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path className="hm-route hm-route-blueB" d={BLUE_2} fill="none" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

          {/* tap point where blue 1 links onto the black route */}
          <g className="hm-node hm-node-j"><circle cx="430" cy="205" r="7" fill="#fff" /><circle cx="430" cy="205" r="3.5" fill="#2563eb" /></g>

          {/* pickups */}
          <g className="hm-node"><circle cx="600" cy="379" r="13" fill="#fff" /><circle cx="600" cy="379" r="5.5" fill="#0a0a23" /></g>
          <g className="hm-node hm-node-2"><circle cx="259" cy="379" r="13" fill="#fff" /><circle cx="259" cy="379" r="5.5" fill="#2563eb" /></g>
          <g className="hm-node hm-node-3"><circle cx="430" cy="379" r="13" fill="#fff" /><circle cx="430" cy="379" r="5.5" fill="#2563eb" /></g>

          {/* destination star */}
          <g className="hm-dest">
            <circle className="hm-dest-pulse" cx="259" cy="205" r="28" fill="#2563eb" opacity="0.18" />
            <circle cx="259" cy="205" r="18" fill="#2563eb" />
            <path d="M259 195 l2.8 5.7 6.3 0.9 -4.55 4.45 1.05 6.3 -5.6 -2.95 -5.6 2.95 1.05 -6.3 -4.55 -4.45 6.3 -0.9 z" fill="#fff" />
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
        .hm-route { stroke-dasharray: 600; stroke-dashoffset: 600; animation: hm-draw 1.8s ease-out forwards; }
        .hm-route-dark  { animation-delay: 0s; }
        .hm-route-blueA { animation-delay: 1.4s; }
        .hm-route-blueB { animation-delay: 2s; }
        @keyframes hm-draw { to { stroke-dashoffset: 0; } }

        .hm-node { transform-box: fill-box; transform-origin: center; animation: hm-pop 0.5s ease-out both; }
        .hm-node-2 { animation-delay: 0.4s; }
        .hm-node-3 { animation-delay: 0.8s; }
        .hm-node-j { animation-delay: 1.9s; }
        @keyframes hm-pop {
          0% { opacity: 0; transform: scale(0.4); }
          70% { transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }

        .hm-dest { transform-box: fill-box; transform-origin: 259px 205px; }
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
