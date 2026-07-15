'use client'

import { useEffect, useRef } from 'react'

/**
 * Dotted globe for the "Where Veesaa is live" section.
 * A dark planet slowly rotates on its tilted axis: dim landmass dots on a
 * transparent body, with blue markers pinned to Nigeria and Canada, each
 * carrying a country-name label. No glow gradients, no connecting lines.
 */

const ROTATION_SECONDS = 60 // one full rotation
const TILT = 0.34 // radians, tips the north pole toward the viewer

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

// Location markers pinned to real coordinates: one blue dot + label per live country.
const MARKERS = [
  { lat: 9.1, lng: 8.7, phase: 0, name: 'NIGERIA' },
  { lat: 56.1, lng: -106.3, phase: 1.1, name: 'CANADA' },
]

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

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

      // ── landmass dots (transparent body, no glow) ──
      for (const d of dots) {
        const lam = d.lam + rot
        const cp = Math.cos(d.phi)
        const x = cp * Math.sin(lam)
        const y = Math.sin(d.phi)
        const z = cp * Math.cos(lam)
        const y2 = y * cosT - z * sinT
        const z2 = y * sinT + z * cosT
        if (z2 <= 0.02) continue // hidden on the back of the planet
        const a = 0.22 + 0.6 * z2
        ctx.fillStyle = `rgba(196,204,218,${a.toFixed(3)})`
        const s = (0.9 + 0.75 * z2) * dpr
        ctx.fillRect(cx + R * x - s / 2, cy - R * y2 - s / 2, s, s)
      }

      // ── pinned markers with country labels ──
      for (let i = 0; i < MARKERS.length; i++) {
        const p = project(MARKERS[i].lat, MARKERS[i].lng, rot, cx, cy, R)
        if (p.z2 <= 0.05) continue
        const pulse = 0.78 + 0.28 * (0.5 + 0.5 * Math.sin((tMs / 1000) * Math.PI + MARKERS[i].phase * Math.PI))
        const r = 3.4 * dpr * (0.75 + 0.4 * p.z2)

        // label pill above the dot
        const label = MARKERS[i].name
        ctx.font = `700 ${11 * dpr}px ui-sans-serif, system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        try { ctx.letterSpacing = `${0.6 * dpr}px` } catch { /* older browsers */ }
        const tw = ctx.measureText(label).width
        const padX = 8 * dpr, padY = 5 * dpr
        const lw = tw + padX * 2
        const lh = 11 * dpr + padY * 2
        const lx = p.sx
        const ly = p.sy - r - 12 * dpr - lh / 2
        ctx.fillStyle = 'rgba(9,11,17,0.9)'
        roundRect(ctx, lx - lw / 2, ly - lh / 2, lw, lh, 5 * dpr)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.fillText(label, lx, ly)
        try { ctx.letterSpacing = '0px' } catch { /* noop */ }
        ctx.textAlign = 'left'
        ctx.textBaseline = 'alphabetic'

        // marker dot with a soft blue glow
        ctx.save()
        ctx.shadowColor = '#3b82f6'
        ctx.shadowBlur = 14 * dpr * pulse
        ctx.fillStyle = '#93c5fd'
        ctx.beginPath()
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
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
