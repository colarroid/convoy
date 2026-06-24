import { supabase } from './supabase'

export interface Experience {
  id: string
  name: string | null
  photo_url: string | null
  body: string
  created_at: string
}

/** Public experiences (optionally only the pinned ones for the landing page). */
export async function getExperiences(pinnedOnly = false): Promise<Experience[]> {
  const { data, error } = await supabase.rpc('list_experiences', { p_pinned_only: pinnedOnly })
  if (error || !data) return []
  return data as Experience[]
}

/** The signed-in member's own experience, if any. */
export async function getMyExperience(): Promise<{ body: string } | null> {
  const { data, error } = await supabase.rpc('get_my_experience')
  if (error || !data || !data[0]) return null
  return { body: data[0].body as string }
}

/** Share (or update) the signed-in member's experience. */
export async function submitExperience(body: string): Promise<void> {
  const { error } = await supabase.rpc('submit_experience', { p_body: body })
  if (error) throw error
}
