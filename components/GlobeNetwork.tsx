'use client'

import { useEffect, useRef } from 'react'

/**
 * Global-network animation for the "Where Veesaa is live" section.
 * A frosted-glass sphere holds a dotted globe (canvas, ~2k dots) slowly
 * rotating on its Y axis; glowing blue markers stay pinned to Nigeria and
 * Canada, green ambient dots pulse, and a ring of upright avatars orbits
 * clockwise above it. Hovering an avatar enlarges it and pauses only it.
 */

const GLOBE_SECONDS = 45 // one full globe rotation
const ORBIT_SECONDS = 21 // one full avatar revolution
const TILT = 0.4 // radians, tips the globe top toward the viewer

// ── rough continent outlines ([lat, lng]) for the dotted landmass ──
const LAND: [number, number][][] = [
  // North America
  [[70,-162],[72,-130],[70,-90],[62,-80],[58,-64],[47,-52],[44,-66],[40,-74],[33,-78],[25,-80],[29,-95],[22,-98],[16,-95],[15,-92],[20,-106],[32,-117],[40,-124],[48,-125],[60,-142],[64,-166]],
  // Greenland
  [[83,-62],[81,-25],[75,-19],[68,-26],[60,-43],[68,-52],[76,-60]],
  // South America
  [[11,-72],[8,-60],[4,-51],[-3,-38],[-13,-38],[-23,-41],[-34,-53],[-39,-62],[-51,-68],[-55,-71],[-46,-74],[-30,-72],[-18,-70],[-4,-81],[4,-78],[9,-76]],
  // Africa
  [[35,-6],[37,10],[33,11],[31,32],[15,39],[11,44],[11,51],[-1,42],[-11,40],[-16,38],[-26,33],[-35,20],[-34,18],[-29,16],[-17,11],[-7,12],[-1,9],[4,9],[4,6],[6,3],[4,-8],[9,-14],[15,-17],[21,-17],[28,-11],[32,-9]],
  // Europe
  [[71,25],[68,45],[60,45],[55,37],[50,40],[45,34],[41,29],[38,24],[36,-6],[43,-9],[44,-1],[48,-5],[51,2],[54,8],[58,6],[62,5],[66,13]],
  // Asia
  [[73,68],[76,105],[72,130],[68,160],[64,178],[60,163],[54,142],[46,138],[40,128],[36,127],[30,122],[24,118],[21,108],[14,109],[9,105],[6,101],[13,99],[16,95],[22,91],[20,87],[15,80],[8,77],[16,73],[21,70],[24,67],[25,57],[27,51],[30,48],[36,44],[40,44],[42,52],[45,52],[47,60],[52,60],[58,68]],
  // Australia
  [[-11,132],[-12,136],[-15,141],[-11,142],[-16,146],[-21,149],[-27,153],[-33,152],[-38,147],[-38,141],[-35,136],[-32,133],[-33,124],[-31,115],[-26,113],[-22,114],[-19,121],[-15,124],[-14,127],[-12,130]],
  // Japan
  [[45,142],[43,145],[38,141],[33,131],[35,133],[41,140]],
  // Borneo / SE Asia hint
  [[7,117],[1,119],[-4,114],[-1,109],[4,108],[7,113]],
  // New Zealand
  [[-35,173],[-39,177],[-44,171],[-46,167],[-41,172]],
]

function inPolygon(lat: number, lng: number, poly: [number, number][]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [yi, xi] = poly[i]
    const [yj, xj] = poly[j]
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

// Sample the landmass into dots once per client.
let DOTS: { phi: number; lam: number }[] | null = null
function getDots() {
  if (DOTS) return DOTS
  const dots: { phi: number; lam: number }[] = []
  for (let lat = -55; lat <= 80; lat += 2) {
    const step = 2 / Math.max(0.3, Math.cos((lat * Math.PI) / 180))
    for (let lng = -180; lng < 180; lng += step) {
      if (LAND.some((p) => inPolygon(lat, lng, p))) {
        dots.push({ phi: (lat * Math.PI) / 180, lam: (lng * Math.PI) / 180 })
      }
    }
  }
  DOTS = dots
  return dots
}

// Location markers pinned to real coordinates.
const MARKERS = [
  // Nigeria (blue)
  { lat: 6.5, lng: 3.4, color: '#60a5fa', glow: '#3b82f6', phase: 0 },
  { lat: 9.1, lng: 7.4, color: '#60a5fa', glow: '#3b82f6', phase: 0.6 },
  // Canada (blue)
  { lat: 43.7, lng: -79.4, color: '#60a5fa', glow: '#3b82f6', phase: 1.1 },
  { lat: 51.0, lng: -114.1, color: '#60a5fa', glow: '#3b82f6', phase: 1.7 },
  // Ambient network activity (green)
  { lat: 48.9, lng: 2.3, color: '#4ade80', glow: '#22c55e', phase: 0.3 },
  { lat: -1.3, lng: 36.8, color: '#4ade80', glow: '#22c55e', phase: 1.0 },
  { lat: 35.7, lng: 139.7, color: '#4ade80', glow: '#22c55e', phase: 1.5 },
  { lat: -23.5, lng: -46.6, color: '#4ade80', glow: '#22c55e', phase: 0.8 },
]

// Orbiting members: real photos cycled with colourful initials.
// Drop more images into public/avatars and add them here.
const PHOTOS = ['/avatars/amara.jpg', '/avatars/neighbour-1.jpg', '/avatars/neighbour-2.jpg']
const AVATARS: ({ img: string } | { initials: string; hue: number })[] = [
  { img: PHOTOS[0] },
  { initials: 'TA', hue: 210 },
  { initials: 'CE', hue: 150 },
  { img: PHOTOS[1] },
  { initials: 'MO', hue: 260 },
  { initials: 'JX', hue: 20 },
  { img: PHOTOS[2] },
  { initials: 'SB', hue: 330 },
  { initials: 'KP', hue: 180 },
  { img: PHOTOS[0] },
  { initials: 'AN', hue: 45 },
  { img: PHOTOS[1] },
  { initials: 'LI', hue: 285 },
  { initials: 'RD', hue: 100 },
]

export default function GlobeNetwork() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const avatarRefs = useRef<(HTMLDivElement | null)[]>([])
  const hovered = useRef<boolean[]>(AVATARS.map(() => false))
  const angleAdj = useRef<number[]>(AVATARS.map(() => 0))
  const lastAngle = useRef<number[]>(AVATARS.map(() => 0))

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dots = getDots()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(2, window.devicePixelRatio || 1)

    const sizeCanvas = () => {
      const r = canvas.getBoundingClientRect()
      canvas.width = Math.round(r.width * dpr)
      canvas.height = Math.round(r.height * dpr)
    }
    sizeCanvas()
    const ro = new ResizeObserver(sizeCanvas)
    ro.observe(canvas)

    const cosT = Math.cos(TILT)
    const sinT = Math.sin(TILT)

    const drawGlobe = (tMs: number) => {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)
      const cx = w / 2
      const cy = h / 2
      const R = Math.min(w, h) * 0.48
      const rot = ((tMs / 1000) * (Math.PI * 2)) / GLOBE_SECONDS

      // landmass dots
      for (const d of dots) {
        const lam = d.lam + rot
        const cp = Math.cos(d.phi)
        const x = cp * Math.sin(lam)
        const y = Math.sin(d.phi)
        const z = cp * Math.cos(lam)
        const y2 = y * cosT - z * sinT
        const z2 = y * sinT + z * cosT
        if (z2 <= 0.02) continue
        const a = 0.1 + 0.42 * z2
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`
        const s = (0.9 + 0.7 * z2) * dpr
        ctx.fillRect(cx + R * x - s / 2, cy - R * y2 - s / 2, s, s)
      }

      // pinned markers (pulse every 2s)
      for (const m of MARKERS) {
        const phi = (m.lat * Math.PI) / 180
        const lam = (m.lng * Math.PI) / 180 + rot
        const cp = Math.cos(phi)
        const x = cp * Math.sin(lam)
        const y = Math.sin(phi)
        const z = cp * Math.cos(lam)
        const y2 = y * cosT - z * sinT
        const z2 = y * sinT + z * cosT
        if (z2 <= 0.05) continue
        const pulse = 0.75 + 0.35 * (0.5 + 0.5 * Math.sin((tMs / 1000) * Math.PI + m.phase * Math.PI))
        const r = 3.2 * dpr * pulse * (0.7 + 0.5 * z2)
        ctx.save()
        ctx.shadowColor = m.glow
        ctx.shadowBlur = 14 * dpr * pulse
        ctx.fillStyle = m.color
        ctx.beginPath()
        ctx.arc(cx + R * x, cy - R * y2, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    const placeAvatars = (tMs: number) => {
      const S = wrap.clientWidth
      const orbitR = S * 0.44
      const base = ((tMs / 1000) * (Math.PI * 2)) / ORBIT_SECONDS
      AVATARS.forEach((_, i) => {
        const el = avatarRefs.current[i]
        if (!el) return
        let a: number
        if (hovered.current[i]) {
          a = lastAngle.current[i]
        } else {
          a = base + (i * Math.PI * 2) / AVATARS.length + angleAdj.current[i]
          lastAngle.current[i] = a
        }
        const x = Math.cos(a) * orbitR
        const y = Math.sin(a) * orbitR
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
      })
    }

    if (reduce) {
      drawGlobe(0)
      placeAvatars(0)
      return () => ro.disconnect()
    }

    let raf = 0
    const frame = (t: number) => {
      drawGlobe(t)
      placeAvatars(t)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  const onEnter = (i: number) => { hovered.current[i] = true }
  const onLeave = (i: number) => {
    // rejoin the orbit exactly where the avatar was paused
    const base = (performance.now() / 1000) * (Math.PI * 2) / ORBIT_SECONDS
    angleAdj.current[i] = lastAngle.current[i] - base - (i * Math.PI * 2) / AVATARS.length
    hovered.current[i] = false
  }

  return (
    <div ref={wrapRef} className="relative mx-auto aspect-square w-full max-w-[460px]" aria-hidden>
      {/* breathing glow */}
      <div className="gn-breathe absolute inset-[10%] rounded-full bg-blue-500/10 blur-3xl" />

      {/* frosted-glass sphere with the dotted globe */}
      <div className="absolute inset-[17%] overflow-hidden rounded-full bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-[2px] shadow-[inset_0_24px_60px_rgba(255,255,255,0.07),inset_0_-34px_70px_rgba(0,0,0,0.55),0_30px_80px_-30px_rgba(0,0,0,0.6)]">
        <canvas ref={canvasRef} className="h-full w-full" />
        {/* soft top-left light */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_24%,rgba(255,255,255,0.16),transparent_46%)]" />
      </div>

      {/* orbiting members */}
      <div className="absolute inset-0">
        {AVATARS.map((av, i) => (
          <div
            key={i}
            ref={(el) => { avatarRefs.current[i] = el }}
            className="absolute left-1/2 top-1/2 -ml-[26px] -mt-[26px] h-[52px] w-[52px] will-change-transform"
          >
            <div
              onMouseEnter={() => onEnter(i)}
              onMouseLeave={() => onLeave(i)}
              className="h-full w-full overflow-hidden rounded-full border-2 border-neutral-800 bg-neutral-900/70 shadow-[0_10px_26px_rgba(0,0,0,0.55)] ring-1 ring-white/10 backdrop-blur-sm transition-transform duration-300 hover:scale-125"
            >
              {'img' in av ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={av.img} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-[13px] font-bold text-white/80">
                  {av.initials}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .gn-breathe {
          animation: gn-breathe 6s ease-in-out infinite;
        }
        @keyframes gn-breathe {
          0%, 100% { transform: scale(0.96); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .gn-breathe { animation: none; }
        }
      `}</style>
    </div>
  )
}
