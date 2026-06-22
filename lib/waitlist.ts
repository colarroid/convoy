import { supabase } from './supabase'

/** Add someone to the "bring Veesaa to your community" waitlist. */
export async function joinWaitlist(community: string, email: string): Promise<void> {
  const { error } = await supabase.rpc('join_waitlist', {
    p_community: community,
    p_email: email,
  })
  if (error) throw error
}
