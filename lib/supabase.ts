import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Surfaced at build/runtime so misconfiguration is obvious rather than silent.
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

/**
 * Browser Supabase client. The app is client-rendered, so a single shared
 * client with localStorage-persisted sessions is the right fit.
 */
export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
