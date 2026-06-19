'use client'

import { useState } from 'react'

// Drop a video URL here when ready (YouTube embed URL or an .mp4). Empty shows a placeholder.
const VIDEO_URL = ''

export default function HowItWorksSection() {
  const [open, setOpen] = useState(false)

  return (
    <section className="bg-gray-50 py-28 md:py-44 px-5 md:px-8">
      <div className="max-w-5xl mx-auto rounded-3xl bg-white shadow-[0_30px_80px_-40px_rgba(0,0,0,0.25)] ring-1 ring-gray-100 px-7 py-16 md:px-16 md:py-28">
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-12 md:gap-16 items-center min-h-[22rem] md:min-h-[28rem]">
          {/* Left: headline + play */}
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-black tracking-tight leading-[1.1]">
              See how Veesaa works.
            </h2>
            <p className="text-gray-500 mt-4 leading-relaxed max-w-md">
              From entering your community code to riding together, the whole thing takes about a minute. Watch it in action.
            </p>

            <button
              onClick={() => setOpen(true)}
              className="group mt-8 inline-flex items-center gap-3 text-black"
              aria-label="Watch how Veesaa works"
            >
              <span className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </span>
              <span className="font-semibold">Watch how it works</span>
            </button>
          </div>

          {/* Right: stat */}
          <div className="md:text-right">
            <p className="text-6xl md:text-7xl font-extrabold tracking-tight text-black leading-none">Free</p>
            <p className="text-sm font-medium text-gray-500 mt-2">No fares, no commission. What every ride costs.</p>
          </div>
        </div>
      </div>

      {/* Video modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        >
          <div className="relative w-full max-w-3xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm font-medium"
            >
              Close
            </button>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-neutral-900 ring-1 ring-white/10 flex items-center justify-center">
              {VIDEO_URL ? (
                <iframe
                  src={VIDEO_URL}
                  title="How Veesaa works"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-center px-6">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                  <p className="text-white font-semibold">Demo video coming soon</p>
                  <p className="text-gray-400 text-sm mt-1">We&apos;re putting the finishing touches on it.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
