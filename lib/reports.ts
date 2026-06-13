import { supabase } from './supabase'

export type ReportCategory =
  | 'unsafe_driving'
  | 'harassment'
  | 'no_show'
  | 'fake_profile'
  | 'inappropriate'
  | 'other'

export const REPORT_CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: 'unsafe_driving', label: 'Unsafe driving' },
  { value: 'harassment',     label: 'Harassment or threats' },
  { value: 'no_show',        label: 'No-show or unreliable' },
  { value: 'fake_profile',   label: 'Fake or misleading profile' },
  { value: 'inappropriate',  label: 'Inappropriate behaviour' },
  { value: 'other',          label: 'Something else' },
]

export async function submitReport(input: {
  reportedUserId?: string
  tripId?: string
  category: ReportCategory
  details: string
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be signed in to report.')

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    reported_user_id: input.reportedUserId ?? null,
    trip_id: input.tripId ?? null,
    category: input.category,
    details: input.details.trim() || null,
  })
  if (error) throw error
}
