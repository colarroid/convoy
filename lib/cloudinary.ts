import { supabase } from './supabase'

/**
 * Upload an image (data URL or Blob) to Cloudinary using a server-signed
 * request and return the hosted secure URL. The API secret stays server-side
 * (see app/api/cloudinary/sign) and only signed-in members can obtain a
 * signature, so the account is no longer open to unsigned uploads.
 */
export async function uploadProfilePhoto(file: string | Blob): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) {
    throw new Error('Please sign in to upload a photo.')
  }

  // Ask our server for a short-lived signature (auth-gated).
  const signRes = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!signRes.ok) {
    let detail = ''
    try { detail = (await signRes.json())?.error ?? '' } catch { /* ignore */ }
    throw new Error(detail || 'Could not prepare the upload.')
  }
  const { cloudName, apiKey, timestamp, signature, folder } = await signRes.json()

  const form = new FormData()
  form.append('file', file)
  form.append('api_key', apiKey)
  form.append('timestamp', String(timestamp))
  form.append('signature', signature)
  form.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    let detail = ''
    try { detail = (await res.json())?.error?.message ?? '' } catch { /* ignore */ }
    throw new Error(detail || 'Photo upload failed.')
  }

  const json = await res.json()
  return json.secure_url as string
}
