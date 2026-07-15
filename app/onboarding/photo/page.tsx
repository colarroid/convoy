'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/userStore'
import { supabase } from '@/lib/supabase'
import { syncProfileToCache } from '@/lib/auth'
import { uploadProfilePhoto } from '@/lib/cloudinary'
import Navbar from '@/components/Navbar'

type Stage = 'idle' | 'camera' | 'crop' | 'preview'

const CROP_PX = 280 // diameter of the circular crop window in screen px

export default function OnboardingPhotoPage() {
  const router    = useRouter()
  const [firstName, setFirstName] = useState('')
  const [stage, setStage]         = useState<Stage>('idle')
  const [rawSrc, setRawSrc]       = useState<string | null>(null)
  const [cropped, setCropped]     = useState<string | null>(null)
  const [saving, setSaving]       = useState(false)
  const [camErr, setCamErr]       = useState('')
  const [uploadErr, setUploadErr] = useState('')

  /* ── camera ── */
  const videoRef  = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  /* ── crop ── */
  const [scale, setScale]   = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const drag        = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null)
  const lastPinch   = useRef<number | null>(null)
  const naturalSize = useRef({ w: 1, h: 1 })

  useEffect(() => {
    const u = getUser()
    if (u) setFirstName(u.firstName)
  }, [])

  /* ─────────── camera helpers ─────────── */
  const startCamera = async () => {
    setCamErr('')
    setStage('camera')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch {
      setCamErr('Camera access was denied. Please allow access and try again.')
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  const captureFrame = () => {
    const v = videoRef.current
    if (!v) return
    const c = document.createElement('canvas')
    c.width  = v.videoWidth
    c.height = v.videoHeight
    const ctx = c.getContext('2d')!
    // mirror selfie
    ctx.translate(c.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(v, 0, 0)
    stopCamera()
    openCrop(c.toDataURL('image/jpeg', 0.92))
  }

  const closeCamera = () => { stopCamera(); setStage('idle') }

  /* ─────────── crop helpers ─────────── */
  const openCrop = (src: string) => {
    setRawSrc(src)
    const img = new Image()
    img.onload = () => {
      naturalSize.current = { w: img.naturalWidth, h: img.naturalHeight }
      const minDim = Math.min(img.naturalWidth, img.naturalHeight)
      const initial = CROP_PX / minDim
      setScale(initial)
      setOffset({ x: 0, y: 0 })
      setStage('crop')
    }
    img.src = src
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = ev => openCrop(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  /* drag */
  const onMouseDown = (e: React.MouseEvent) => {
    drag.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y }
  }
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drag.current) return
    setOffset({ x: drag.current.ox + e.clientX - drag.current.sx, y: drag.current.oy + e.clientY - drag.current.sy })
  }, [])
  const onMouseUp = () => { drag.current = null }

  /* touch drag + pinch */
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      drag.current = { sx: e.touches[0].clientX, sy: e.touches[0].clientY, ox: offset.x, oy: offset.y }
      lastPinch.current = null
    } else if (e.touches.length === 2) {
      drag.current = null
      lastPinch.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      )
    }
  }
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length === 1 && drag.current) {
      setOffset({ x: drag.current.ox + e.touches[0].clientX - drag.current.sx, y: drag.current.oy + e.touches[0].clientY - drag.current.sy })
    } else if (e.touches.length === 2 && lastPinch.current !== null) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
      setScale(s => Math.max(0.5, Math.min(6, s * (d / lastPinch.current!))))
      lastPinch.current = d
    }
  }, [])
  const onTouchEnd = () => { drag.current = null; lastPinch.current = null }

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setScale(s => Math.max(0.5, Math.min(6, s * (e.deltaY > 0 ? 0.92 : 1.08))))
  }

  /* apply crop → canvas → dataURL */
  const applyCrop = () => {
    if (!rawSrc) return
    const img = new Image()
    img.onload = () => {
      const OUT = 480
      const c   = document.createElement('canvas')
      c.width   = OUT; c.height = OUT
      const ctx = c.getContext('2d')!
      ctx.beginPath()
      ctx.arc(OUT / 2, OUT / 2, OUT / 2, 0, Math.PI * 2)
      ctx.clip()
      /* map screen crop coords back to source image coords */
      const rW   = img.naturalWidth  * scale
      const rH   = img.naturalHeight * scale
      const imgL = -rW / 2 + offset.x
      const imgT = -rH / 2 + offset.y
      const sx   = (-CROP_PX / 2 - imgL) / scale
      const sy   = (-CROP_PX / 2 - imgT) / scale
      const ss   = CROP_PX / scale
      ctx.drawImage(img, sx, sy, ss, ss, 0, 0, OUT, OUT)
      setCropped(c.toDataURL('image/jpeg', 0.92))
      setStage('preview')
    }
    img.src = rawSrc
  }

  const handleContinue = async () => {
    if (!cropped) return
    setSaving(true)
    setUploadErr('')
    try {
      // Upload the cropped selfie to Cloudinary and store the hosted URL.
      const url = await uploadProfilePhoto(cropped)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({ photo_url: url }).eq('id', user.id)
      }
      // Refresh the local cache from the session (name/email/phone/photo + the
      // onboarded flag) so the app recognises the user as signed in, important
      // for Google sign-ups that never touched the email-signup cache path.
      await syncProfileToCache()
      localStorage.setItem('veesaa_onboarded', '1')
      router.push('/')
    } catch (e) {
      setSaving(false)
      setUploadErr(e instanceof Error ? e.message : 'Could not upload your photo. Please try again.')
    }
  }

  /* ─────────── render ─────────── */
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar showAuth="login" />

      {/* ══ CAMERA MODAL ══ */}
      {stage === 'camera' && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {camErr ? (
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
              <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <p className="text-white text-sm leading-relaxed">{camErr}</p>
              <button onClick={closeCamera} className="mt-2 px-6 py-3 rounded-xl bg-white text-black text-sm font-semibold">Go back</button>
            </div>
          ) : (
            <>
              {/* Video feed */}
              <div className="flex-1 relative overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                {/* Circular crop guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-64 h-64">
                    {/* dark vignette outside circle */}
                    <div className="absolute inset-0 rounded-full ring-[9999px] ring-black/60" />
                    {/* circle border */}
                    <div className="absolute inset-0 rounded-full border-2 border-white/70" />
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between px-8 py-8 bg-black">
                <button onClick={closeCamera} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Shutter */}
                <button
                  onClick={captureFrame}
                  className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform"
                  style={{ width: 72, height: 72 }}
                >
                  <div className="w-14 h-14 rounded-full bg-white" />
                </button>

                <div className="w-12" /> {/* spacer */}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ CROP MODAL ══ */}
      {stage === 'crop' && rawSrc && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={() => setStage('idle')} className="text-white/70 text-sm hover:text-white">Cancel</button>
            <span className="text-white text-sm font-semibold">Move and scale</span>
            <div className="w-12" />
          </div>

          {/* Crop area */}
          <div
            className="flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onWheel={onWheel}
            style={{ touchAction: 'none' }}
          >
            {/* Image layer */}
            <div className="relative" style={{ width: CROP_PX, height: CROP_PX }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={rawSrc}
                alt=""
                draggable={false}
                style={{
                  position: 'absolute',
                  width:  naturalSize.current.w * scale,
                  height: naturalSize.current.h * scale,
                  left: '50%',
                  top:  '50%',
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />

              {/* Dark overlay with circular hole using box-shadow */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)' }}
              />
              {/* Circle border */}
              <div className="absolute inset-0 rounded-full border-2 border-white/70 pointer-events-none" />
            </div>
          </div>

          {/* Hint */}
          <p className="text-white/50 text-xs text-center pb-3">Drag to reposition · Scroll or pinch to zoom</p>

          {/* Confirm */}
          <div className="px-5 pb-8">
            <button
              onClick={applyCrop}
              className="w-full py-3.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-gray-100 active:scale-[0.98] transition-all"
            >
              Use this photo
            </button>
          </div>
        </div>
      )}

      {/* ══ MAIN IDLE / PREVIEW ══ */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm flex flex-col items-center">

          {/* Step dots */}
          <div className="flex items-center gap-1.5 mb-8">
            {[1, 2, 3].map(n => (
              <div key={n} className={`h-1 rounded-full transition-all ${n === 3 ? 'w-6 bg-black' : 'w-3 bg-gray-200'}`} />
            ))}
          </div>

          <h1 className="text-2xl font-bold text-black text-center mb-1">
            {firstName ? `Hey ${firstName} 👋` : 'One last thing'}
          </h1>
          <p className="text-sm text-gray-400 text-center mb-8 leading-relaxed">
            Add a profile photo so your community<br />knows who to look out for.
          </p>

          {/* Avatar preview */}
          <div className="relative w-40 h-40 rounded-full mb-8">
            {cropped ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cropped} alt="Profile" className="w-full h-full rounded-full object-cover ring-4 ring-black" />
                {/* Retake overlay */}
                <button
                  onClick={() => setStage('idle')}
                  className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                >
                  <span className="text-white text-xs font-semibold">Retake</span>
                </button>
              </>
            ) : (
              <div className="w-full h-full rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center">
                <svg className="w-10 h-10 text-gray-300 mb-1" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span className="text-xs text-gray-400">No photo yet</span>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="w-full flex flex-col gap-3">
            {/* Take selfie, getUserMedia */}
            <button
              type="button"
              onClick={startCamera}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              Take a selfie
            </button>

            {/* Choose from gallery, label triggers file input */}
            <label
              htmlFor="gallery-input"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer select-none"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Choose from gallery
            </label>

            {/* Continue, only when cropped photo is ready */}
            {cropped && (
              <button
                type="button"
                onClick={handleContinue}
                disabled={saving}
                className="w-full py-3.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Looks good, continue
                  </>
                )}
              </button>
            )}
          </div>

          {uploadErr && <p className="text-sm text-red-500 text-center mt-4">{uploadErr}</p>}

          <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed max-w-xs">
            Your photo is only visible to members of communities you join.
          </p>
        </div>
      </main>

      {/* Gallery file input */}
      <input id="gallery-input" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
    </div>
  )
}
