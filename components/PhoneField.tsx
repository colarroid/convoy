'use client'

import { useState } from 'react'
import { COUNTRY_CODES, type Country } from '@/lib/countries'

interface PhoneFieldProps {
  country: Country
  localPhone: string
  onCountryChange: (c: Country) => void
  onLocalChange: (digits: string) => void
  placeholder?: string
}

export default function PhoneField({
  country,
  localPhone,
  onCountryChange,
  onLocalChange,
  placeholder,
}: PhoneFieldProps) {
  // Default the example number to the selected country (e.g. CA → 4161234567).
  placeholder = placeholder ?? country.example
  const [open, setOpen] = useState(false)

  return (
    <div className="relative flex items-stretch rounded-xl border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-black focus-within:border-transparent focus-within:bg-white transition-all">
      {/* Country picker trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 pl-3.5 pr-2 py-3.5 text-sm text-gray-700 hover:text-black transition-colors shrink-0 border-r border-gray-200 focus:outline-none"
      >
        <span className="text-base leading-none">{country.flag}</span>
        <span className="font-medium">{country.dial}</span>
        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Number input */}
      <input
        type="tel"
        placeholder={placeholder}
        value={localPhone}
        // Strip non-digits AND any leading zeros — the country code (e.g. +234)
        // already covers the national prefix, so "0816…" → "816…".
        onChange={(e) => onLocalChange(e.target.value.replace(/\D/g, '').replace(/^0+/, ''))}
        autoComplete="tel-national"
        inputMode="numeric"
        className="flex-1 bg-transparent px-3 py-3.5 text-sm text-black placeholder-gray-400 focus:outline-none min-w-0"
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
          {COUNTRY_CODES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => { onCountryChange(c); setOpen(false) }}
              className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors
                ${c.code === country.code ? 'bg-gray-50 text-black' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <span className="text-base">{c.flag}</span>
              <span className="font-medium">{c.name}</span>
              <span className="text-gray-400 ml-auto">{c.dial}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
