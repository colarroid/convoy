import { supabase } from './supabase'
import { geocodeAddress } from './googleMaps'
import type { OfferDraft } from './offerStore'

const COLOR_HEX: Record<string, string> = {
  Black: '#111111', White: '#FFFFFF', Silver: '#C0C0C0', Gray: '#808080',
  Blue: '#1a56db', Red: '#e02424', Green: '#057a55', Gold: '#d4a017', Brown: '#7B4F2E',
}

/** Resolve a community by its code via the security-definer RPC. */
export async function getCommunityByCode(code: string) {
  const { data, error } = await supabase.rpc('get_community_by_code', { p_code: code })
  if (error) throw error
  // rpc returning a composite row gives back the object (or null-ish if no match)
  return data && data.id ? data : null
}

/** Combine "YYYY-MM-DD" + "h:mm AM/PM" into an ISO timestamp (local time). */
function toDepartsAt(date?: string, time?: string): string | null {
  if (!date || !time) return null
  const m = time.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!m) return null
  let h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  const ap = m[3].toUpperCase()
  if (ap === 'PM' && h !== 12) h += 12
  if (ap === 'AM' && h === 12) h = 0
  const [y, mo, d] = date.split('-').map(Number)
  return new Date(y, mo - 1, d, h, min).toISOString()
}

/** Create a trip from the offer draft. Returns the new trip id. */
export async function createTrip(draft: OfferDraft): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be signed in to offer a ride.')

  const community = await getCommunityByCode(draft.communityCode ?? '')
  if (!community) throw new Error('That community code could not be found.')

  const vehicle = draft.unknownVehicle
    ? 'Hired ride (Uber / Bolt / In-drive)'
    : [draft.vehicleMake, draft.vehicleModel].filter(Boolean).join(' ')

  const seats = draft.seats ?? 1

  // Ensure the pickup has coordinates (for proximity matching) even if the host
  // typed it freely without picking a suggestion.
  let pLat = draft.pickupLat ?? null
  let pLng = draft.pickupLng ?? null
  if ((pLat == null || pLng == null) && draft.pickupPlace) {
    const g = await geocodeAddress(draft.pickupPlace)
    if (g) { pLat = g.lat; pLng = g.lng }
  }

  const { data, error } = await supabase
    .from('trips')
    .insert({
      host_id: user.id,
      community_id: community.id,
      depart_date: draft.date,
      depart_time: draft.time,
      departs_at: toDepartsAt(draft.date, draft.time),
      pickup_point: draft.pickupPlace,
      pickup_note: draft.pickupNote || null,
      pickup_lat: pLat,
      pickup_lng: pLng,
      vehicle: vehicle || null,
      color: draft.unknownVehicle ? null : (draft.color || null),
      color_hex: draft.unknownVehicle ? '#9CA3AF' : (COLOR_HEX[draft.color ?? ''] ?? '#9CA3AF'),
      plate_number: draft.unknownVehicle ? null : (draft.plateNumber || null),
      unknown_vehicle: !!draft.unknownVehicle,
      seats_total: seats,
      seats_open: seats,
    })
    .select('id')
    .single()

  if (error) {
    // RLS blocks suspended members from inserting a trip (see migration 0016).
    if (error.code === '42501') throw new Error('Your account is suspended. Please contact your community admin.')
    throw error
  }
  return data.id as string
}

// ── My Trips (host-facing) ──

export interface MyTripRow {
  id: string
  community_name: string
  area: string | null
  community_logo: string | null
  depart_date: string   // YYYY-MM-DD
  depart_time: string
  departs_at: string | null
  pickup_point: string
  pickup_note: string | null
  vehicle: string | null
  color_hex: string | null
  seats_total: number
  seats_open: number
  status: string
  pending_count: number
}

export interface JoinedTripRow {
  trip_id: string
  host_name: string | null
  host_photo: string | null
  host_rides: number
  host_phone: string | null
  community_name: string
  area: string | null
  community_logo: string | null
  depart_date: string
  depart_time: string
  departs_at: string | null
  pickup_point: string
  pickup_note: string | null
  vehicle: string | null
  color_hex: string | null
  status: string
}

export interface RequestRow {
  request_id: string
  status: 'pending' | 'approved' | 'declined'
  rider_id: string
  rider_name: string | null
  rider_photo: string | null
  rider_rides: number
  rider_phone: string | null
  created_at: string
}

export async function getMyTrips(): Promise<MyTripRow[]> {
  const { data, error } = await supabase.rpc('get_my_trips')
  if (error) throw error
  return (data ?? []) as MyTripRow[]
}

export async function getTripDetail(id: string): Promise<MyTripRow | null> {
  const { data, error } = await supabase.rpc('get_trip_detail', { p_trip: id })
  if (error) throw error
  return (data?.[0] as MyTripRow) ?? null
}

export async function getTripRequests(tripId: string, status?: 'pending' | 'approved' | 'declined'): Promise<RequestRow[]> {
  const { data, error } = await supabase.rpc('get_trip_requests', { p_trip: tripId, p_status: status ?? null })
  if (error) throw error
  return (data ?? []) as RequestRow[]
}

export async function resolveRequest(requestId: string, action: 'approved' | 'declined') {
  const { error } = await supabase.rpc('resolve_request', { p_request: requestId, p_action: action })
  if (error) throw error
}

export async function getMyJoinedTrips(): Promise<JoinedTripRow[]> {
  const { data, error } = await supabase.rpc('get_my_joined_trips')
  if (error) throw error
  return (data ?? []) as JoinedTripRow[]
}

export async function completeTrip(tripId: string) {
  const { error } = await supabase.rpc('complete_trip', { p_trip: tripId })
  if (error) throw error
}

/** Host cancels a ride. Notifies approved riders server-side. */
export async function cancelTrip(tripId: string): Promise<void> {
  const { error } = await supabase.rpc('cancel_trip', { p_trip: tripId })
  if (error) throw error
}

/** Rider withdraws their request / leaves a ride. Notifies the host server-side. */
export async function withdrawRequest(tripId: string): Promise<void> {
  const { error } = await supabase.rpc('withdraw_request', { p_trip: tripId })
  if (error) throw error
}

/** Whether a trip's departure time has passed. */
export function isPast(departsAt: string | null): boolean {
  return !!departsAt && new Date(departsAt).getTime() < Date.now()
}

// ── Find flow (rider-facing) ──

export interface RideRow {
  id: string
  host_id: string
  host_name: string | null
  host_photo: string | null
  host_rides: number
  community_name: string
  area: string | null
  community_logo: string | null
  depart_date: string
  depart_time: string
  pickup_point: string
  pickup_note: string | null
  vehicle: string | null
  color: string | null
  color_hex: string | null
  seats_total: number
  seats_open: number
  already_requested: boolean
  distance_km: number | null
}

export async function getCommunityTrips(
  code: string,
  coords?: { lat: number; lng: number },
  radiusKm = 10,
): Promise<RideRow[]> {
  const { data, error } = await supabase.rpc('get_community_trips', {
    p_code: code,
    p_lat: coords?.lat ?? null,
    p_lng: coords?.lng ?? null,
    p_radius_km: radiusKm,
  })
  if (error) throw error
  return (data ?? []) as RideRow[]
}

export async function requestToJoin(code: string, tripId: string) {
  const { error } = await supabase.rpc('request_to_join', { p_code: code, p_trip: tripId })
  if (error) throw error
}

// ── Ride history + counts ──

export interface RideHistoryRow {
  trip_id: string
  role: 'offered' | 'joined'
  counterpart: string | null
  destination: string
  pickup_point: string
  depart_date: string
  status: 'open' | 'completed' | 'cancelled'
}

export async function getRideHistory(): Promise<RideHistoryRow[]> {
  const { data, error } = await supabase.rpc('get_ride_history')
  if (error) throw error
  return (data ?? []) as RideHistoryRow[]
}

/** The signed-in user's completed-ride count from their profile. */
export async function getRidesCompleted(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0
  const { data } = await supabase.from('profiles').select('rides_completed').eq('id', user.id).single()
  return data?.rides_completed ?? 0
}

/** Friendly ride-count label: "No rides yet" for 0, else "N rides completed". */
export function ridesLabel(n: number | null | undefined): string {
  if (!n || n <= 0) return 'No rides yet'
  return `${n} ${n === 1 ? 'ride' : 'rides'} completed`
}

/** Format a YYYY-MM-DD date for display, e.g. "Sat, 10 June 2026". */
export function formatTripDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  })
}
