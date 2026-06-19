const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

/**
 * Upload an image (data URL or Blob) to Cloudinary via an unsigned preset and
 * return the hosted secure URL. No API secret is used client-side, the preset
 * only permits uploads.
 */
export async function uploadProfilePhoto(file: string | Blob): Promise<string> {
  if (!CLOUD || !PRESET) {
    throw new Error('Cloudinary is not configured.')
  }

  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', PRESET)
  form.append('folder', 'convoy/avatars')

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
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
