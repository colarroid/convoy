'use client'

/**
 * Animated "neighbours converging on a destination" map for the desktop hero.
 * Pure SVG + CSS so it stays crisp and lightweight. A stylised street grid with
 * blocks, a park and a river sits under two routes that draw toward a starred
 * destination, with pulsing pickup nodes and a floating match card.
 */
export default function HeroMap() {
  return (
    <div className="relative w-full max-w-[560px]">
      <div className="relative overflow-hidden rounded-[28px] bg-[#f3f5fb] ring-1 ring-black/5 shadow-[0_40px_90px_-50px_rgba(20,24,60,0.35)]">
        <svg viewBox="0 0 560 560" className="block w-full h-auto" role="img" aria-label="Neighbours matched on a shared ride to Riverside Hall">
          <defs>
            <linearGradient id="hm-sky" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#eef1fb" />
              <stop offset="1" stopColor="#e7ecf9" />
            </linearGradient>
            <filter id="hm-soft" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#1f2a5e" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* base */}
          <rect width="560" height="560" fill="url(#hm-sky)" />

          {/* park */}
          <rect x="40" y="150" width="150" height="120" rx="20" fill="#dcecdd" />
          {/* river */}
          <path d="M-20 470 C 120 430, 200 540, 360 480 S 600 470, 600 470 L 600 600 L -20 600 Z" fill="#d4e4f7" />

          {/* city blocks */}
          <g fill="#e2e7f4">
            <rect x="230" y="60"  width="120" height="90"  rx="16" />
            <rect x="400" y="120" width="120" height="90"  rx="16" />
            <rect x="60"  y="300" width="110" height="100" rx="16" />
            <rect x="250" y="250" width="120" height="110" rx="16" />
            <rect x="430" y="380" width="110" height="120" rx="16" />
          </g>

          {/* street grid */}
          <g stroke="#ffffff" strokeWidth="10" strokeLinecap="round" opacity="0.9">
            <line x1="0" y1="120" x2="560" y2="120" />
            <line x1="0" y1="360" x2="560" y2="360" />
            <line x1="210" y1="0" x2="210" y2="560" />
            <line x1="390" y1="0" x2="390" y2="560" />
          </g>
          <g stroke="#eef1fb" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 12" opacity="0.9">
            <line x1="0" y1="120" x2="560" y2="120" />
            <line x1="0" y1="360" x2="560" y2="360" />
            <line x1="210" y1="0" x2="210" y2="560" />
            <line x1="390" y1="0" x2="390" y2="560" />
          </g>

          {/* ---- routes: pickups feed a shared spine to the destination (430,210) ----
               Black spine runs SW pickup -> junction (360,270) -> star.
               Both blue lines branch off their pickups and merge at the junction,
               then a blue trunk follows the spine the rest of the way to the star. */}
          {/* black spine (full) */}
          <path className="hm-route hm-route-dark" d="M150 470 C 250 430, 300 360, 360 270 C 380 240, 405 220, 430 210" fill="none" stroke="#0a0a23" strokeWidth="5" strokeLinecap="round" />
          {/* blue branch from NW pickup into the junction */}
          <path className="hm-route hm-route-blueA" d="M120 210 C 200 235, 300 252, 360 270" fill="none" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
          {/* blue branch from SE pickup into the junction */}
          <path className="hm-route hm-route-blueB" d="M520 470 C 455 400, 400 325, 360 270" fill="none" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
          {/* blue trunk following the spine from the junction up to the star */}
          <path className="hm-route hm-route-trunk" d="M360 270 C 380 240, 405 220, 430 210" fill="none" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />

          {/* junction where the branches merge onto the spine */}
          <g className="hm-node hm-node-junction">
            <circle cx="360" cy="270" r="9" fill="#fff" />
            <circle cx="360" cy="270" r="4" fill="#2563eb" />
          </g>

          {/* pickup nodes */}
          <g className="hm-node">
            <circle cx="120" cy="210" r="16" fill="#fff" />
            <circle cx="120" cy="210" r="7" fill="#2563eb" />
          </g>
          <g className="hm-node hm-node-2">
            <circle cx="150" cy="470" r="16" fill="#fff" />
            <circle cx="150" cy="470" r="7" fill="#0a0a23" />
          </g>
          <g className="hm-node hm-node-3">
            <circle cx="520" cy="470" r="16" fill="#fff" />
            <circle cx="520" cy="470" r="7" fill="#2563eb" />
          </g>

          {/* destination star */}
          <g className="hm-dest">
            <circle className="hm-dest-pulse" cx="430" cy="210" r="34" fill="#2563eb" opacity="0.18" />
            <circle cx="430" cy="210" r="22" fill="#2563eb" filter="url(#hm-soft)" />
            <path d="M430 198 l3.4 6.9 7.6 1.1 -5.5 5.4 1.3 7.6 -6.8 -3.6 -6.8 3.6 1.3 -7.6 -5.5 -5.4 7.6 -1.1 z" fill="#fff" />
          </g>
        </svg>

        {/* top label */}
        <div className="absolute left-5 top-5 text-[11px] font-semibold tracking-[0.12em] text-[#5b6486]">
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
        <div className="hm-card absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3 shadow-[0_20px_50px_-20px_rgba(20,24,60,0.45)]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0a0a23] text-xs font-bold text-white">AO</span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-[#0a0a23]">Amara O.</span>
            <span className="block truncate text-xs text-[#5b6486]">Driving to Riverside Hall · 3 seats</span>
          </span>
          <span className="rounded-md bg-[#e6edff] px-2 py-1 text-[10px] font-bold tracking-wide text-[#2563eb]">MATCH</span>
        </div>
      </div>

      <style jsx>{`
        .hm-route {
          stroke-dasharray: 700;
          stroke-dashoffset: 700;
          animation: hm-draw 2s ease-out forwards;
        }
        /* draw order: spine, then the two blue branches, then the blue trunk to the star */
        .hm-route-dark  { animation-delay: 0s; }
        .hm-route-blueA { animation-delay: 1s; }
        .hm-route-blueB { animation-delay: 1.3s; }
        .hm-route-trunk { animation-delay: 2.6s; animation-duration: 1.1s; }
        @keyframes hm-draw {
          to { stroke-dashoffset: 0; }
        }
        .hm-node { transform-box: fill-box; transform-origin: center; animation: hm-pop 0.5s ease-out both; }
        .hm-node-2 { animation-delay: 0.4s; }
        .hm-node-3 { animation-delay: 0.8s; }
        .hm-node-junction { animation-delay: 2.5s; }
        @keyframes hm-pop {
          0% { opacity: 0; transform: scale(0.4); }
          70% { transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }
        .hm-dest { transform-box: fill-box; transform-origin: 430px 210px; }
        .hm-dest-pulse { animation: hm-pulse 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        @keyframes hm-pulse {
          0%, 100% { transform: scale(0.85); opacity: 0.25; }
          50% { transform: scale(1.25); opacity: 0.05; }
        }
        .hm-card { animation: hm-rise 0.6s ease-out 3.5s both; }
        @keyframes hm-rise {
          0% { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hm-route, .hm-node, .hm-card { animation: none; stroke-dashoffset: 0; opacity: 1; transform: none; }
          .hm-dest-pulse { animation: none; }
        }
      `}</style>
    </div>
  )
}
