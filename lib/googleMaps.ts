/* eslint-disable @typescript-eslint/no-explicit-any */

let loader: Promise<any> | null = null

/** Load the Google Maps JS API (Places library) once, shared across the app. */
export function loadGoogleMaps(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  const w = window as any
  if (w.google?.maps?.places) return Promise.resolve(w.google)
  if (loader) return loader

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  loader = new Promise((resolve, reject) => {
    if (!key) { reject(new Error('Google Maps key missing')); return }
    const cbName = '__convoyMapsInit'
    w[cbName] = () => resolve(w.google)
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&loading=async&callback=${cbName}`
    s.async = true
    s.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(s)
  })
  return loader
}

/** Turn a typed address into coordinates (used to anchor a location even when
    the user types freely without picking a suggestion). */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address.trim()) return null
  try {
    const g = await loadGoogleMaps()
    const geocoder = new g.maps.Geocoder()
    return await new Promise((resolve) => {
      geocoder.geocode({ address, componentRestrictions: { country: 'ng' } }, (res: any[] | null, status: string) => {
        const loc = res?.[0]?.geometry?.location
        if (status === 'OK' && loc) resolve({ lat: loc.lat(), lng: loc.lng() })
        else resolve(null)
      })
    })
  } catch {
    return null
  }
}
