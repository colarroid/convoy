import { supabase } from './supabase'

/** Whether the signed-in user's account is suspended (read via RLS-allowed own row). */
export async function getMySuspended(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase.from('profiles').select('suspended').eq('id', user.id).single()
  return !!data?.suspended
}
