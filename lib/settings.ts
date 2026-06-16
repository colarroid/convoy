import { supabase } from './supabase'

export interface Settings {
  pushNotifications: boolean
  emailUpdates: boolean
  rideReminders: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  pushNotifications: true,
  emailUpdates: true,
  rideReminders: true,
}

const COLUMN: Record<keyof Settings, string> = {
  pushNotifications: 'push_notifications',
  emailUpdates: 'email_updates',
  rideReminders: 'ride_reminders',
}

/** Read the signed-in user's notification preferences from `user_settings`. */
export async function getMySettings(): Promise<Settings> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return DEFAULT_SETTINGS
  const { data } = await supabase
    .from('user_settings')
    .select('push_notifications, email_updates, ride_reminders')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!data) return DEFAULT_SETTINGS
  return {
    pushNotifications: data.push_notifications,
    emailUpdates: data.email_updates,
    rideReminders: data.ride_reminders,
  }
}

/** Persist a single preference (per-account, syncs across devices). */
export async function updateMySetting(key: keyof Settings, value: boolean) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: user.id, [COLUMN[key]]: value }, { onConflict: 'user_id' })
  if (error) throw error
}
