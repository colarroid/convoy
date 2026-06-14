'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from 'react'
import { loadGoogleMaps } from '@/lib/googleMaps'
import { PLACES_COUNTRIES } from '@/lib/countries'

export interface PlaceCoords { lat: number; lng: number }

interface AddressAutocompleteProps {
  value: string
  onChange: (text: string, coords?: PlaceCoords) => void
  placeholder?: string
  /** ISO country code(s) to bias suggestions to. Defaults to all launch countries. */
  country?: string | string[]
  autoFocus?: boolean
  leftAdornment?: React.ReactNode
  rightAdornment?: React.ReactNode
  /** Styles the input row (the bordered box). */
  wrapperClassName?: string
}

interface Prediction { placeId: string; main: string; secondary: string }

export default function AddressAutocomplete({
  value, onChange, placeholder = 'Search a place or landmark',
  country = PLACES_COUNTRIES, autoFocus, leftAdornment, rightAdornment,
  wrapperClassName = 'flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-black focus-within:border-transparent focus-within:bg-white transition-all',
}: AddressAutocompleteProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [open, setOpen] = useState(false)
  const svc = useRef<any>(null)         // AutocompleteService
  const places = useRef<any>(null)      // PlacesService
  const token = useRef<any>(null)       // session token
  const boxRef = useRef<HTMLDivElement>(null)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    loadGoogleMaps().then((g) => {
      svc.current = new g.maps.places.AutocompleteService()
      places.current = new g.maps.places.PlacesService(document.createElement('div'))
      token.current = new g.maps.places.AutocompleteSessionToken()
    }).catch(() => { /* autocomplete just won't show; free text still works */ })
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const query = (input: string) => {
    if (!svc.current || input.trim().length < 2) { setPredictions([]); return }
    svc.current.getPlacePredictions(
      { input, sessionToken: token.current, componentRestrictions: country ? { country } : undefined },
      (res: any[] | null) => {
        setPredictions(
          (res ?? []).map(p => ({
            placeId: p.place_id,
            main: p.structured_formatting?.main_text ?? p.description,
            secondary: p.structured_formatting?.secondary_text ?? '',
          }))
        )
      }
    )
  }

  const handleInput = (text: string) => {
    onChange(text)              // free text always flows through
    setOpen(true)
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => query(text), 250)
  }

  const select = (p: Prediction) => {
    setOpen(false)
    setPredictions([])
    if (!places.current) { onChange(p.secondary ? `${p.main}, ${p.secondary}` : p.main); return }
    places.current.getDetails(
      { placeId: p.placeId, fields: ['formatted_address', 'geometry'], sessionToken: token.current },
      (place: any, status: string) => {
        const g = (window as any).google
        // fresh session token after a details lookup (billing best practice)
        token.current = new g.maps.places.AutocompleteSessionToken()
        if (status === 'OK' && place) {
          const loc = place.geometry?.location
          onChange(
            place.formatted_address ?? p.main,
            loc ? { lat: loc.lat(), lng: loc.lng() } : undefined,
          )
        } else {
          onChange(p.secondary ? `${p.main}, ${p.secondary}` : p.main)
        }
      }
    )
  }

  return (
    <div ref={boxRef} className="relative">
      <div className={wrapperClassName}>
        {leftAdornment}
        <input
          type="text"
          value={value}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => value.length >= 2 && predictions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          className="flex-1 bg-transparent text-sm text-black placeholder-gray-400 focus:outline-none min-w-0"
        />
        {rightAdornment}
      </div>

      {open && predictions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 overflow-hidden max-h-72 overflow-y-auto">
          {predictions.map(p => (
            <button
              key={p.placeId}
              type="button"
              onClick={() => select(p)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
            >
              <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-black truncate">{p.main}</span>
                {p.secondary && <span className="block text-xs text-gray-400 truncate">{p.secondary}</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
