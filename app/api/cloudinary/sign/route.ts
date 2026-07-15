import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Signs Cloudinary uploads server-side so the API secret never reaches the
// browser and only signed-in users can upload. Replaces the old unsigned preset.
export const runtime = 'nodejs'

const FOLDER = 'veesaa/avatars'

export async function POST(req: Request) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary is not configured.' }, { status: 500 })
  }

  // Require a valid Supabase session: only signed-in members may request a signature.
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!token || !url || !anon) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
  }
  const supabase = createClient(url, anon)
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
  }

  // Cloudinary signature: sha1 of the alphabetically-sorted params + api secret.
  const timestamp = Math.floor(Date.now() / 1000)
  const toSign = `folder=${FOLDER}&timestamp=${timestamp}`
  const signature = createHash('sha1').update(toSign + apiSecret).digest('hex')

  return NextResponse.json({ cloudName, apiKey, timestamp, signature, folder: FOLDER })
}
