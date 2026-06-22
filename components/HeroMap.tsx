'use client'

/**
 * Illustrated city-map hero (no real map tiles). Gray land, a dense network of
 * thin streets, a few fat arterial roads, parks and a river. The route runs
 * ALONG the fat arterial: the black pickup follows it all the way to the starred
 * destination, and the two blue pickups link onto it from side arterials.
 */

// The main arterial the route follows. Reused for the fat white road and the
// dark route drawn on top of it, so the route sits exactly on the road.
const MAIN = 'M70 560 C 150 525, 190 470, 250 440 C 320 405, 350 360, 380 300 C 405 245, 440 190, 470 150'
// Side arterials the blue pickups travel before merging onto MAIN.
const BRANCH_E = 'M560 360 C 480 350, 425 332, 380 300'   // merges at (380,300)
const BRANCH_S = 'M250 560 C 250 510, 250 472, 250 440'   // merges at (250,440)

export default function HeroMap() {
  return (
    <div className="relative w-full max-w-[560px]">
      <div className="relative aspect-square overflow-hidden rounded-[28px] ring-1 ring-black/5 shadow-[0_40px_90px_-50px_rgba(20,24,60,0.35)]">
        <svg viewBox="0 0 600 600" className="block h-full w-full" role="img" aria-label="Neighbours routed along the main road to a shared destination">
          {/* land */}
          <rect width="600" height="600" fill="#d8dade" />

          {/* parks */}
          <g fill="#bcdca6">
            <ellipse cx="95" cy="80" rx="46" ry="34" />
            <rect x="300" y="120" width="44" height="40" rx="8" />
            <rect x="520" y="210" width="26" height="40" rx="6" />
            <path d="M0 470 L 210 470 C 170 540, 120 580, 40 600 L 0 600 Z" />
            <rect x="300" y="560" width="120" height="60" rx="10" />
          </g>

          {/* river + lake */}
          <path d="M600 430 C 540 470, 560 540, 520 600 L 600 600 Z" fill="#a9cbe8" />
          <ellipse cx="300" cy="585" rx="34" ry="20" fill="#a9cbe8" />

          {/* ---- thin street network ---- */}
          <g stroke="#f3f4f6" strokeWidth="3" strokeLinecap="round" fill="none">
            {/* diagonal grid, top-left */}
            <path d="M-10 120 L 240 -10" /><path d="M-10 170 L 290 -10" /><path d="M-10 220 L 340 -10" />
            <path d="M-10 280 L 260 60" /><path d="M-10 340 L 230 130" /><path d="M-10 410 L 250 200" />
            <path d="M30 -10 L 200 200" /><path d="M120 -10 L 300 230" /><path d="M210 -10 L 360 200" />
            {/* horizontals */}
            <path d="M250 60 L 600 30" /><path d="M270 130 L 600 120" /><path d="M300 210 L 600 230" />
            <path d="M40 470 L 250 460" /><path d="M430 300 L 600 320" /><path d="M460 400 L 600 410" />
            {/* verticals / curves, right side */}
            <path d="M470 -10 L 480 150" /><path d="M560 20 L 570 200" /><path d="M650 30 L 520 260" />
            <path d="M430 240 L 470 470" /><path d="M540 270 L 560 470" /><path d="M610 360 L 470 540" />
            {/* lower neighbourhood */}
            <path d="M70 520 L 260 510" /><path d="M90 560 L 250 555" /><path d="M120 600 L 300 540" />
            <path d="M300 500 L 470 510" /><path d="M340 470 L 360 600" /><path d="M410 460 L 430 600" />
            <path d="M150 430 L 250 500" /><path d="M30 500 L 120 560" />
          </g>

          {/* ---- fat arterial roads (white) ---- */}
          <g stroke="#fbfbfd" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* extra arterials for context */}
            <path d="M-10 250 C 150 230, 320 250, 600 180" />
            <path d="M470 150 C 520 200, 560 320, 600 420" />
            {/* the route's roads */}
            <path d={MAIN} />
            <path d={BRANCH_E} />
            <path d={BRANCH_S} />
          </g>
          {/* thin centre line on the route's arterial */}
          <g stroke="#e3e4e8" strokeWidth="2" strokeDasharray="2 9" strokeLinecap="round" fill="none">
            <path d={MAIN} /><path d={BRANCH_E} /><path d={BRANCH_S} />
          </g>

          {/* ---- the route, running along the fat arterial ---- */}
          <path className="hm-route hm-route-dark" d={MAIN} fill="none" stroke="#0a0a23" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path className="hm-route hm-route-blueA" d={BRANCH_E} fill="none" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path className="hm-route hm-route-blueB" d={BRANCH_S} fill="none" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

          {/* junctions where the blues link onto the route */}
          <g className="hm-node hm-node-jA"><circle cx="380" cy="300" r="8" fill="#fff" /><circle cx="380" cy="300" r="4" fill="#2563eb" /></g>
          <g className="hm-node hm-node-jB"><circle cx="250" cy="440" r="8" fill="#fff" /><circle cx="250" cy="440" r="4" fill="#2563eb" /></g>

          {/* pickups */}
          <g className="hm-node"><circle cx="70" cy="560" r="16" fill="#fff" /><circle cx="70" cy="560" r="7" fill="#0a0a23" /></g>
          <g className="hm-node hm-node-2"><circle cx="560" cy="360" r="16" fill="#fff" /><circle cx="560" cy="360" r="7" fill="#2563eb" /></g>
          <g className="hm-node hm-node-3"><circle cx="250" cy="560" r="16" fill="#fff" /><circle cx="250" cy="560" r="7" fill="#2563eb" /></g>

          {/* destination star */}
          <g className="hm-dest">
            <circle className="hm-dest-pulse" cx="470" cy="150" r="34" fill="#2563eb" opacity="0.18" />
            <circle cx="470" cy="150" r="22" fill="#2563eb" />
            <path d="M470 138 l3.4 6.9 7.6 1.1 -5.5 5.4 1.3 7.6 -6.8 -3.6 -6.8 3.6 1.3 -7.6 -5.5 -5.4 7.6 -1.1 z" fill="#fff" />
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
        .hm-route { stroke-dasharray: 900; stroke-dashoffset: 900; animation: hm-draw 2.2s ease-out forwards; }
        .hm-route-dark  { animation-delay: 0s; }
        .hm-route-blueA { animation-delay: 1.6s; }
        .hm-route-blueB { animation-delay: 2s; }
        @keyframes hm-draw { to { stroke-dashoffset: 0; } }

        .hm-node { transform-box: fill-box; transform-origin: center; animation: hm-pop 0.5s ease-out both; }
        .hm-node-2 { animation-delay: 0.4s; }
        .hm-node-3 { animation-delay: 0.8s; }
        .hm-node-jA { animation-delay: 2.4s; }
        .hm-node-jB { animation-delay: 2.7s; }
        @keyframes hm-pop {
          0% { opacity: 0; transform: scale(0.4); }
          70% { transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }

        .hm-dest { transform-box: fill-box; transform-origin: 470px 150px; }
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
