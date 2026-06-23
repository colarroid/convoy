'use client'

/**
 * Illustrated city-map hero. The map, the route (black line to the starred
 * destination, blue feeders linking onto it) and the location markers are all
 * baked into public/hero-map.svg (cropped to a square viewBox 0 100 500 500).
 * Here we just frame it and lay the card UI on top. The destination star sits
 * at ~70.8% across, ~93% down in that viewBox.
 */
export default function HeroMap() {
  return (
    <div className="relative w-full max-w-[600px]">
      <div className="relative aspect-square overflow-hidden rounded-[28px] ring-1 ring-black/5 shadow-[0_40px_90px_-50px_rgba(20,24,60,0.35)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero-map.svg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />

        {/* gentle pulse on the destination */}
        <span className="hm-pulse pointer-events-none absolute block h-12 w-12 rounded-full" style={{ left: '70.8%', top: '93%' }} />

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
        .hm-pulse {
          transform: translate(-50%, -50%);
          background: rgba(249, 13, 59, 0.22);
          animation: hm-pulse 2.4s ease-in-out infinite;
        }
        @keyframes hm-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(0.7); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hm-pulse { animation: none; opacity: 0; }
        }
      `}</style>
    </div>
  )
}
