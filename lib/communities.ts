import { supabase } from './supabase'

/** A community the signed-in user holds (has previously entered the code for). */
export interface HeldCommunity {
  community_id: string
  code: string
  name: string
  area: string | null
  logo_url: string | null
  joined_at: string
  last_used_at: string
}

/**
 * Validate a code and record/refresh the caller's membership (the remembered
 * shortcut). Returns the full community row, or null if the code isn't found.
 * Bumps last_used_at; preserves joined_at.
 */
export async function joinCommunityByCode(code: string) {
  const { data, error } = await supabase.rpc('join_community_by_code', { p_code: code })
  if (error) throw error
  return data && data.id ? data : null
}

/** The caller's held communities, re-validated against the live code gate, recent first. */
export async function getMyCommunities(): Promise<HeldCommunity[]> {
  const { data, error } = await supabase.rpc('get_my_communities')
  if (error) throw error
  return (data ?? []) as HeldCommunity[]
}

/** Soft-leave a community (drops it from the picker; row kept for analytics). */
export async function leaveCommunity(communityId: string) {
  const { error } = await supabase.rpc('leave_community', { p_community: communityId })
  if (error) throw error
}

/** A community for the public directory (no code exposed). */
export interface PublicCommunity {
  name: string
  area: string | null
  country: string // ISO-2
}

/** Public list of communities (name, area, country) for the Communities page. */
export async function getPublicCommunities(): Promise<PublicCommunity[]> {
  const { data, error } = await supabase.rpc('list_public_communities')
  if (error || !data) return []
  return data as PublicCommunity[]
}
