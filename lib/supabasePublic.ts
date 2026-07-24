import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Anonymous, session-less client for server-rendered public content such as the
 * blog. The shared client in `supabase.ts` persists sessions to localStorage and
 * reads the URL for tokens, neither of which makes sense on the server.
 */
export const supabasePublic = createClient(url ?? '', anonKey ?? '', {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})
