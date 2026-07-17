import { supabase } from './supabase'
import type { TripDirection } from './trips'

/**
 * Demand signal. Every ride search is recorded with how many results it showed;
 * a search with zero results is unmet demand, and it cannot be reconstructed
 * later, so we record it as it happens rather than after the fact.
 */
export async function recordRideWant(params: {
  code: string
  place?: string
  lat?: number
  lng?: number
  results: number
  direction?: TripDirection
  locality?: string
}): Promise<string | null> {
  const { data, error } = await supabase.rpc('record_ride_want', {
    p_code: params.code,
    p_place: params.place ?? null,
    p_lat: params.lat ?? null,
    p_lng: params.lng ?? null,
    p_results: params.results,
    p_direction: params.direction ?? 'to_community',
    p_locality: params.locality ?? null,
  })
  // Never let the signal break the rider's search.
  if (error) return null
  return (data as string) ?? null
}

/** Opt the rider in to being notified when a matching ride is posted. */
export async function setRideWantNotify(wantId: string, on = true): Promise<void> {
  await supabase.rpc('set_ride_want_notify', { p_want: wantId, p_on: on })
}
