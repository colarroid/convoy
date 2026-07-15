'use client'

import { useEffect, useRef } from 'react'

/**
 * Cinematic dotted globe for the "Where Veesaa is live" section.
 * A dark planet slowly rotates on its tilted axis: dim grey landmass dots, a
 * bright blue atmospheric glow hugging one limb, a subtle warm counter-rim on
 * the other, and blue markers pinned to Nigeria and Canada joined by a glowing
 * great-circle arc. All drawn on a single canvas, no dependencies.
 */

const ROTATION_SECONDS = 60 // one full rotation
const TILT = 0.34 // radians, tips the north pole toward the viewer

// Light directions in screen space (y points down). Blue lit limb sits lower-left.
const LX = -0.6, LY = 0.8 // blue atmosphere
const WX = 0.6, WY = -0.8 // warm counter-rim

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

// Location markers pinned to real coordinates: one blue dot per live country.
const MARKERS = [
  { lat: 9.1, lng: 8.7, phase: 0 },     // Nigeria
  { lat: 56.1, lng: -106.3, phase: 1.1 }, // Canada
]

export default function GlobeNetwork() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    // Project a lat/lng to screen space for the current rotation.
    const project = (latDeg: number, lngDeg: number, rot: number, cx: number, cy: number, R: number) => {
      const phi = (latDeg * Math.PI) / 180
      const lam = (lngDeg * Math.PI) / 180 + rot
      const cp = Math.cos(phi)
      const x = cp * Math.sin(lam)
      const y = Math.sin(phi)
      const z = cp * Math.cos(lam)
      const y2 = y * cosT - z * sinT
      const z2 = y * sinT + z * cosT // > 0 on the front hemisphere
      return { sx: cx + R * x, sy: cy - R * y2, z2 }
    }

    const draw = (tMs: number) => {
      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2
      const R = Math.min(w, h) * 0.42
      const rot = ((tMs / 1000) * (Math.PI * 2)) / ROTATION_SECONDS
      ctx.clearRect(0, 0, w, h)

      // ── atmosphere (drawn behind the opaque body, shows as an outer halo) ──
      ctx.globalCompositeOperation = 'lighter'
      // full faint rim halo
      const halo = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.22)
      halo.addColorStop(0, 'rgba(59,130,246,0)')
      halo.addColorStop(0.35, 'rgba(59,130,246,0.10)')
      halo.addColorStop(0.6, 'rgba(96,165,250,0.05)')
      halo.addColorStop(1, 'rgba(96,165,250,0)')
      ctx.fillStyle = halo
      ctx.fillRect(0, 0, w, h)
      // bright blue crescent on the lit limb
      const bx = cx + R * LX, by = cy + R * LY
      const blue = ctx.createRadialGradient(bx, by, 0, bx, by, R * 1.05)
      blue.addColorStop(0, 'rgba(96,165,250,0.55)')
      blue.addColorStop(0.4, 'rgba(59,130,246,0.28)')
      blue.addColorStop(1, 'rgba(59,130,246,0)')
      ctx.fillStyle = blue
      ctx.fillRect(0, 0, w, h)
      // subtle warm counter-rim
      const wx = cx + R * WX, wy = cy + R * WY
      const warm = ctx.createRadialGradient(wx, wy, 0, wx, wy, R * 0.9)
      warm.addColorStop(0, 'rgba(251,146,60,0.28)')
      warm.addColorStop(0.45, 'rgba(234,88,12,0.12)')
      warm.addColorStop(1, 'rgba(234,88,12,0)')
      ctx.fillStyle = warm
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'

      // ── opaque planet body (shaded toward the lit limb) ──
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.clip()
      const body = ctx.createRadialGradient(cx + R * LX * 0.5, cy + R * LY * 0.5, R * 0.1, cx, cy, R * 1.1)
      body.addColorStop(0, '#0e1a2b')
      body.addColorStop(0.6, '#070c15')
      body.addColorStop(1, '#04060b')
      ctx.fillStyle = body
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2)

      // ── landmass dots ──
      ctx.globalCompositeOperation = 'lighter'
      for (const d of dots) {
        const lam = d.lam + rot
        const cp = Math.cos(d.phi)
        const x = cp * Math.sin(lam)
        const y = Math.sin(d.phi)
        const z = cp * Math.cos(lam)
        const y2 = y * cosT - z * sinT
        const z2 = y * sinT + z * cosT
        if (z2 <= 0.02) continue // hidden on the back of an opaque planet
        const sx = x, sy = -y2
        const edge = Math.min(1, sx * sx + sy * sy)
        const lit = Math.max(0, sx * LX + sy * LY) * edge
        const warmth = Math.max(0, sx * WX + sy * WY) * edge * 0.5

        let r = 150, g = 162, b = 185
        let a = 0.10 + 0.26 * z2
        // blue rim light
        r = r * (1 - lit) + 96 * lit
        g = g * (1 - lit) + 165 * lit
        b = b * (1 - lit) + 255 * lit
        a += 0.6 * lit
        // warm rim light
        r = r * (1 - warmth) + 255 * warmth
        g = g * (1 - warmth) + 168 * warmth
        b = b * (1 - warmth) + 116 * warmth
        a += 0.22 * warmth

        ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${Math.min(0.9, a).toFixed(3)})`
        const s = (0.85 + 0.7 * z2 + 0.9 * lit) * dpr
        ctx.fillRect(cx + R * x - s / 2, cy - R * y2 - s / 2, s, s)
      }
      ctx.globalCompositeOperation = 'source-over'
      ctx.restore()

      // ── connecting arc between markers (only when both are on the front) ──
      const pts = MARKERS.map((m) => project(m.lat, m.lng, rot, cx, cy, R))
      if (pts[0].z2 > 0.08 && pts[1].z2 > 0.08) {
        const [p1, p2] = pts
        const mx = (p1.sx + p2.sx) / 2
        const my = (p1.sy + p2.sy) / 2
        // bow the arc away from the globe centre
        let nx = mx - cx, ny = my - cy
        const nl = Math.hypot(nx, ny) || 1
        nx /= nl; ny /= nl
        const ctrlX = mx + nx * R * 0.55
        const ctrlY = my + ny * R * 0.55
        ctx.globalCompositeOperation = 'lighter'
        ctx.beginPath()
        ctx.moveTo(p1.sx, p1.sy)
        ctx.quadraticCurveTo(ctrlX, ctrlY, p2.sx, p2.sy)
        ctx.strokeStyle = 'rgba(96,165,250,0.55)'
        ctx.lineWidth = 1.4 * dpr
        ctx.shadowColor = '#3b82f6'
        ctx.shadowBlur = 8 * dpr
        ctx.stroke()
        // travelling pulse along the arc
        const tt = (tMs / 1000) % 3 / 3
        const px = (1 - tt) * (1 - tt) * p1.sx + 2 * (1 - tt) * tt * ctrlX + tt * tt * p2.sx
        const py = (1 - tt) * (1 - tt) * p1.sy + 2 * (1 - tt) * tt * ctrlY + tt * tt * p2.sy
        ctx.beginPath()
        ctx.arc(px, py, 2.2 * dpr, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(191,219,254,0.9)'
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.globalCompositeOperation = 'source-over'
      }

      // ── pinned markers (pulse every 2s) ──
      ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < MARKERS.length; i++) {
        const p = pts[i]
        if (p.z2 <= 0.05) continue
        const pulse = 0.75 + 0.35 * (0.5 + 0.5 * Math.sin((tMs / 1000) * Math.PI + MARKERS[i].phase * Math.PI))
        const r = 3.1 * dpr * pulse * (0.7 + 0.5 * p.z2)
        ctx.save()
        ctx.shadowColor = '#3b82f6'
        ctx.shadowBlur = 16 * dpr * pulse
        ctx.fillStyle = '#93c5fd'
        ctx.beginPath()
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      ctx.globalCompositeOperation = 'source-over'
    }

    if (reduce) {
      draw(0)
      return () => ro.disconnect()
    }

    let raf = 0
    const frame = (t: number) => {
      draw(t)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <div ref={wrapRef} className="relative mx-auto aspect-square w-full max-w-[520px]" aria-hidden>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
