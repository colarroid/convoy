import { supabase } from './supabase'

export interface AppNotification {
  id: string
  title: string
  body: string | null
  url: string | null
  read: boolean
  created_at: string
}

export async function getNotifications(): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, title, body, url, read, created_at')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return (data ?? []) as AppNotification[]
}

export async function getUnreadCount(): Promise<number> {
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('read', false)
  return count ?? 0
}

export async function markAllRead(): Promise<void> {
  await supabase.from('notifications').update({ read: true }).eq('read', false)
}

/** Friendly relative/absolute timestamp for the list. */
export function formatNotifTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min}m ago`
  const hrs = Math.floor(min / 60)
  if (hrs < 24 && now.getDate() === d.getDate()) return d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' })
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' })}`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' })
}
