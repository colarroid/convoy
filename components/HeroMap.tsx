'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef } from 'react'
import { loadGoogleMaps } from '@/lib/googleMaps'

// A real, fixed location with a clear street network. The route is snapped to
// real roads by the Directions API; the two blue pickups naturally share the
// final approach into the starred destination.
const DESTINATION = { lat: 6.5113, lng: 3.3706 } // "Riverside Hall"
const BLACK_PICKUP = { lat: 6.5022, lng: 3.3631 }
const BLUE_PICKUPS = [
  { lat: 6.5168, lng: 3.3772 },
  { lat: 6.5046, lng: 3.3798 },
]

// Clean, label-light style so it reads as an illustration but is a real map.
const MAP_STYLE: any[] = [
  { elementType: 'geometry', stylers: [{ color: '#e7ebf6' }] },
  { elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#e7ebf6' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#f7f9ff' }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#cfe1f5' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ visibility: 'on' }, { color: '#d6e8d8' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', stylers: [{ visibility: 'off' }] },
]

const svgIcon = (svg: string) => 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg)

const pickupIcon = (color: string) =>
  svgIcon(`<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34"><circle cx="17" cy="17" r="15" fill="#fff"/><circle cx="17" cy="17" r="6.5" fill="${color}"/></svg>`)

const starIcon = svgIcon(
  `<svg xmlns="http://www.w3.org/2000/svg" width="54" height="54"><circle cx="27" cy="27" r="22" fill="#2563eb"/><path d="M27 14 l4 8.1 8.9 1.3 -6.45 6.3 1.5 8.9 -7.95 -4.2 -7.95 4.2 1.5 -8.9 -6.45 -6.3 8.9 -1.3 z" fill="#fff"/></svg>`
)

/** Real map with road-snapped routes converging on the destination. */
export default function HeroMap() {
  const mapEl = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    let map: any

    loadGoogleMaps().then((g: any) => {
      if (cancelled || !mapEl.current) return

      map = new g.maps.Map(mapEl.current, {
        center: { lat: 6.5085, lng: 3.3715 },
        zoom: 14,
        disableDefaultUI: true,
        gestureHandling: 'none',
        keyboardShortcuts: false,
        draggable: false,
        styles: MAP_STYLE,
        backgroundColor: '#e7ebf6',
      })

      // Star destination + a soft pulse ring.
      new g.maps.Marker({ position: DESTINATION, map, icon: { url: starIcon, scaledSize: new g.maps.Size(54, 54), anchor: new g.maps.Point(27, 27) }, zIndex: 50 })
      new g.maps.Circle({ map, center: DESTINATION, radius: 180, strokeWeight: 0, fillColor: '#2563eb', fillOpacity: 0.12, clickable: false })

      // Pickup markers.
      new g.maps.Marker({ position: BLACK_PICKUP, map, icon: { url: pickupIcon('#0a0a23'), scaledSize: new g.maps.Size(34, 34), anchor: new g.maps.Point(17, 17) }, zIndex: 40 })
      BLUE_PICKUPS.forEach(p =>
        new g.maps.Marker({ position: p, map, icon: { url: pickupIcon('#2563eb'), scaledSize: new g.maps.Size(34, 34), anchor: new g.maps.Point(17, 17) }, zIndex: 40 })
      )

      const directions = new g.maps.DirectionsService()

      // Draw one route, animating the polyline along its real road path.
      const drawRoute = (origin: any, color: string, weight: number, delay: number) => {
        directions.route(
          { origin, destination: DESTINATION, travelMode: g.maps.TravelMode.DRIVING },
          (res: any, status: string) => {
            if (cancelled || status !== 'OK' || !res.routes[0]) {
              // Fallback: a straight road-less line so the map still shows a link.
              const poly = new g.maps.Polyline({ path: [origin, DESTINATION], strokeColor: color, strokeWeight: weight, map })
              void poly
              return
            }
            const full = res.routes[0].overview_path as any[]
            const poly = new g.maps.Polyline({ path: [], strokeColor: color, strokeWeight: weight, strokeOpacity: 1, map, zIndex: color === '#2563eb' ? 30 : 20 })
            const total = full.length
            const stepSize = Math.max(1, Math.ceil(total / 90))
            let i = 0
            const tick = () => {
              if (cancelled) return
              i += stepSize
              poly.setPath(full.slice(0, Math.min(i, total)))
              if (i < total) requestAnimationFrame(tick)
            }
            window.setTimeout(tick, delay)
          }
        )
      }

      drawRoute(BLACK_PICKUP, '#0a0a23', 6, 200)
      drawRoute(BLUE_PICKUPS[0], '#2563eb', 5, 1400)
      drawRoute(BLUE_PICKUPS[1], '#2563eb', 5, 1900)
    }).catch(() => { /* map key unavailable; leave the styled background */ })

    return () => { cancelled = true }
  }, [])

  return (
    <div className="relative w-full max-w-[560px]">
      <div className="relative aspect-square overflow-hidden rounded-[28px] bg-[#e7ebf6] ring-1 ring-black/5 shadow-[0_40px_90px_-50px_rgba(20,24,60,0.35)]">
        <div ref={mapEl} className="absolute inset-0" />

        {/* top label */}
        <div className="pointer-events-none absolute left-5 top-5 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-[#5b6486] backdrop-blur">
          RIVERSIDE · SUNDAY 8:40
        </div>

        {/* neighbours pill */}
        <div className="pointer-events-none absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-[0_10px_30px_-12px_rgba(20,24,60,0.4)]">
          <span className="flex -space-x-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#cdd7f6] text-[9px] font-bold text-[#2563eb] ring-2 ring-white">K</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f6d9c9] text-[9px] font-bold text-[#c2410c] ring-2 ring-white">T</span>
          </span>
          <span className="text-xs font-semibold text-[#0a0a23]">+2 neighbours going</span>
        </div>

        {/* match card */}
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3 shadow-[0_20px_50px_-20px_rgba(20,24,60,0.45)]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0a0a23] text-xs font-bold text-white">AO</span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-[#0a0a23]">Amara O.</span>
            <span className="block truncate text-xs text-[#5b6486]">Driving to Riverside Hall · 3 seats</span>
          </span>
          <span className="rounded-md bg-[#e6edff] px-2 py-1 text-[10px] font-bold tracking-wide text-[#2563eb]">MATCH</span>
        </div>
      </div>
    </div>
  )
}
