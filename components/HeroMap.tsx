'use client'

/**
 * Animated map for the desktop hero. A stylised street grid (roads, blocks, a
 * park and a river) sits under a navigation-style route: the black pickup runs
 * along the roads to the starred destination, and the two blue pickups link
 * onto that same route, following the streets the rest of the way to the star.
 *
 * Grid roads: vertical x = 100/230/360/490, horizontal y = 110/250/390/510.
 *   star (destination) = (360,110)
 *   black pickup       = (100,510)
 *   blue pickups       = (490,390) and (230,510)
 *   junction (merge)   = (230,250)
 */
export default function HeroMap() {
  return (
    <div className="relative w-full max-w-[560px]">
      <div className="relative overflow-hidden rounded-[28px] bg-[#e7ebf6] ring-1 ring-black/5 shadow-[0_40px_90px_-50px_rgba(20,24,60,0.35)]">
        <svg viewBox="0 0 600 600" className="block w-full h-auto" role="img" aria-label="Neighbours routed along the roads to a shared destination">
          <defs>
            <filter id="hm-soft" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#1f2a5e" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* land base */}
          <rect width="600" height="600" fill="#e7ebf6" />

          {/* a few blocks with a touch of variety */}
          <g fill="#dde3f1">
            <rect x="120" y="130" width="90"  height="100" rx="12" />
            <rect x="250" y="130" width="90"  height="100" rx="12" />
            <rect x="380" y="270" width="90"  height="100" rx="12" />
            <rect x="120" y="270" width="90"  height="100" rx="12" />
            <rect x="250" y="410" width="90"  height="80"  rx="12" />
          </g>
          {/* park */}
          <rect x="380" y="410" width="90" height="80" rx="16" fill="#d6e8d8" />
          {/* river through the corner */}
          <path d="M-20 560 C 90 520, 150 600, 250 560 L 250 620 L -20 620 Z" fill="#cfe1f5" />

          {/* ---- roads (white casing + dashed centre line) ---- */}
          <g stroke="#f7f9ff" strokeWidth="18" strokeLinecap="round">
            {/* vertical */}
            <line x1="100" y1="40" x2="100" y2="560" />
            <line x1="230" y1="40" x2="230" y2="560" />
            <line x1="360" y1="40" x2="360" y2="560" />
            <line x1="490" y1="40" x2="490" y2="560" />
            {/* horizontal */}
            <line x1="40" y1="110" x2="560" y2="110" />
            <line x1="40" y1="250" x2="560" y2="250" />
            <line x1="40" y1="390" x2="560" y2="390" />
            <line x1="40" y1="510" x2="560" y2="510" />
          </g>
          <g stroke="#dfe5f3" strokeWidth="2.5" strokeDasharray="2 10" strokeLinecap="round">
            <line x1="100" y1="40" x2="100" y2="560" />
            <line x1="230" y1="40" x2="230" y2="560" />
            <line x1="360" y1="40" x2="360" y2="560" />
            <line x1="490" y1="40" x2="490" y2="560" />
            <line x1="40" y1="110" x2="560" y2="110" />
            <line x1="40" y1="250" x2="560" y2="250" />
            <line x1="40" y1="390" x2="560" y2="390" />
            <line x1="40" y1="510" x2="560" y2="510" />
          </g>

          {/* ---- the route, snapped to the roads ---- */}
          {/* black pickup -> junction -> star (the main route) */}
          <path className="hm-route hm-route-dark"
                d="M100 510 L100 250 L230 250 L230 110 L360 110"
                fill="none" stroke="#0a0a23" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          {/* blue pickup (E) links onto the route at the junction */}
          <path className="hm-route hm-route-blueA"
                d="M490 390 L490 250 L230 250"
                fill="none" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          {/* blue pickup (S) links onto the route at the junction */}
          <path className="hm-route hm-route-blueB"
                d="M230 510 L230 250"
                fill="none" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          {/* blue trunk: from the junction the blues follow the road up to the star */}
          <path className="hm-route hm-route-trunk"
                d="M230 250 L230 110 L360 110"
                fill="none" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

          {/* junction where the blues merge onto the route */}
          <g className="hm-node hm-node-junction">
            <circle cx="230" cy="250" r="9" fill="#fff" />
            <circle cx="230" cy="250" r="4.5" fill="#2563eb" />
          </g>

          {/* pickup locations */}
          <g className="hm-node">
            <circle cx="100" cy="510" r="16" fill="#fff" />
            <circle cx="100" cy="510" r="7" fill="#0a0a23" />
          </g>
          <g className="hm-node hm-node-2">
            <circle cx="490" cy="390" r="16" fill="#fff" />
            <circle cx="490" cy="390" r="7" fill="#2563eb" />
          </g>
          <g className="hm-node hm-node-3">
            <circle cx="230" cy="510" r="16" fill="#fff" />
            <circle cx="230" cy="510" r="7" fill="#2563eb" />
          </g>

          {/* destination star */}
          <g className="hm-dest">
            <circle className="hm-dest-pulse" cx="360" cy="110" r="34" fill="#2563eb" opacity="0.18" />
            <circle cx="360" cy="110" r="22" fill="#2563eb" filter="url(#hm-soft)" />
            <path d="M360 98 l3.4 6.9 7.6 1.1 -5.5 5.4 1.3 7.6 -6.8 -3.6 -6.8 3.6 1.3 -7.6 -5.5 -5.4 7.6 -1.1 z" fill="#fff" />
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
          stroke-dasharray: 800;
          stroke-dashoffset: 800;
          animation: hm-draw 2s ease-out forwards;
        }
        /* draw order: main black route, then the blue links, then the shared trunk to the star */
        .hm-route-dark  { animation-delay: 0s; }
        .hm-route-blueA { animation-delay: 1.2s; }
        .hm-route-blueB { animation-delay: 1.6s; }
        .hm-route-trunk { animation-delay: 2.8s; animation-duration: 1.1s; }
        @keyframes hm-draw { to { stroke-dashoffset: 0; } }

        .hm-node { transform-box: fill-box; transform-origin: center; animation: hm-pop 0.5s ease-out both; }
        .hm-node-2 { animation-delay: 0.4s; }
        .hm-node-3 { animation-delay: 0.8s; }
        .hm-node-junction { animation-delay: 2.7s; }
        @keyframes hm-pop {
          0% { opacity: 0; transform: scale(0.4); }
          70% { transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }

        .hm-dest { transform-box: fill-box; transform-origin: 360px 110px; }
        .hm-dest-pulse { animation: hm-pulse 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        @keyframes hm-pulse {
          0%, 100% { transform: scale(0.85); opacity: 0.25; }
          50% { transform: scale(1.25); opacity: 0.05; }
        }

        .hm-card { animation: hm-rise 0.6s ease-out 3.8s both; }
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
