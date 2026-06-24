import { supabase } from './supabase'

export interface CallRequestInput {
  name?: string
  email: string
  community?: string
  isAdmin: boolean
  note?: string
}

/** Submit a "schedule a call" request from the Communities page. */
export async function requestCall(input: CallRequestInput): Promise<void> {
  const { error } = await supabase.rpc('request_call', {
    p_name: input.name ?? '',
    p_email: input.email,
    p_community: input.community ?? '',
    p_is_admin: input.isAdmin,
    p_note: input.note ?? '',
  })
  if (error) throw error
}
