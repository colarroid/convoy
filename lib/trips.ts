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

/** Great-circle distance between two coordinates, in kilometres. */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Total whole kilometres shared across all completed trips (public landing stat). */
export async function getKmShared(): Promise<number> {
  const { data, error } = await supabase.rpc('total_km_shared')
  if (error || data == null) return 0
  return Number(data) || 0
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

  // Distance covered: pickup -> the community's destination. Best-effort; if we
  // can't resolve the destination coords we just leave it null.
  let distanceKm: number | null = null
  if (pLat != null && pLng != null) {
    const destAddr = community.address || community.area
    if (destAddr) {
      const dest = await geocodeAddress(destAddr)
      if (dest) distanceKm = haversineKm(pLat, pLng, dest.lat, dest.lng)
    }
  }

  // Fields both legs share. The community is always one end of the trip, and
  // pickup_* is always the member-side point: where riders are picked up on the
  // way there, and where they are dropped off on the way back.
  const shared = {
    host_id: user.id,
    community_id: community.id,
    depart_date: draft.date,
    pickup_point: draft.pickupPlace,
    pickup_note: draft.pickupNote || null,
    pickup_lat: pLat,
    pickup_lng: pLng,
    locality: draft.pickupLocality || null,
    distance_km: distanceKm,
    vehicle: vehicle || null,
    color: draft.unknownVehicle ? null : (draft.color || null),
    color_hex: draft.unknownVehicle ? '#9CA3AF' : (COLOR_HEX[draft.color ?? ''] ?? '#9CA3AF'),
    plate_number: draft.unknownVehicle ? null : (draft.plateNumber || null),
    unknown_vehicle: !!draft.unknownVehicle,
  }

  const direction = draft.direction ?? 'to_community'

  const { data, error } = await supabase
    .from('trips')
    .insert({
      ...shared,
      direction,
      depart_time: draft.time,
      departs_at: toDepartsAt(draft.date, draft.time),
      seats_total: seats,
      seats_open: seats,
    })
    .select('id')
    .single()

  if (error) {
    // RLS blocks suspended members from inserting a trip (see migration 0016).
    if (error.code === '42501') throw new Error('Your account is suspended. Please contact your community admin.')
    // Supabase errors are plain objects, not Error instances, so re-throw as a
    // real Error. Otherwise callers checking `instanceof Error` fall back to a
    // generic message and the actual cause is invisible.
    throw new Error(error.message || 'Could not post your ride. Please try again.')
  }
  const tripId = data.id as string

  // Paired return: a separate trip, posted now so members can find it early.
  // The date is fixed to the outbound's; only seats and time can differ.
  // A standalone return has no outbound to mirror, so it never pairs.
  if (direction === 'to_community' && draft.returning && draft.returnTime) {
    const rSeats = draft.returnSeats ?? seats
    const { error: rErr } = await supabase.from('trips').insert({
      ...shared,
      direction: 'from_community',
      paired_trip_id: tripId,
      depart_time: draft.returnTime,
      departs_at: toDepartsAt(draft.date, draft.returnTime),
      seats_total: rSeats,
      seats_open: rSeats,
    })
    // The outbound is already posted, so a failed return must not lose it. The
    // host can still offer the return on its own.
    if (rErr) throw new Error('Your ride was posted, but the return trip could not be created. You can offer it separately from My trips.')
  }

  return tripId
}

// ── Direction ──

/**
 * A community code identifies the shared place; a trip either heads to it or
 * comes back from it. `pickup_point` is always the member-side point: where
 * riders are picked up going there, and dropped off coming back.
 */
export type TripDirection = 'to_community' | 'from_community'

export const isReturn = (d?: TripDirection | null) => d === 'from_community'

/** Label for the member-side point, which flips meaning with direction. */
export const pointLabel = (d?: TripDirection | null) =>
  isReturn(d) ? 'Drop-off point' : 'Pickup point'

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
  direction: TripDirection
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
  direction: TripDirection
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

/** Host cancels a ride. Notifies approved + pending riders server-side.
 *  An optional reason is shared with passengers and recorded for the admin. */
export async function cancelTrip(tripId: string, reason?: string): Promise<void> {
  const { error } = await supabase.rpc('cancel_trip', { p_trip: tripId, p_reason: reason?.trim() || null })
  if (error) throw error
}

/** Host permanently deletes one of their own cancelled trips. */
export async function deleteTrip(tripId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_trip', { p_trip: tripId })
  if (error) throw error
}

/** Rider removes a joined trip from their own list (e.g. a cancelled ride). */
export async function forgetJoinedTrip(tripId: string): Promise<void> {
  const { error } = await supabase.rpc('forget_joined_trip', { p_trip: tripId })
  if (error) throw error
}

/** Rider withdraws their request / leaves a ride. Notifies the host server-side. */
export async function withdrawRequest(tripId: string): Promise<void> {
  const { error } = await supabase.rpc('withdraw_request', { p_trip: tripId })
  if (error) throw error
}

/** Host records why a past trip didn't happen (optional note, to improve the platform). */
export async function recordTripFeedback(tripId: string, reason: string): Promise<void> {
  const { error } = await supabase.rpc('record_trip_feedback', { p_trip: tripId, p_reason: reason })
  if (error) throw error
}

/** Whether a trip's departure time has passed. */
export function isPast(departsAt: string | null): boolean {
  return !!departsAt && new Date(departsAt).getTime() < Date.now()
}

/** Whether a trip's departure passed more than `minutes` ago. */
export function isPastBy(departsAt: string | null, minutes: number): boolean {
  return !!departsAt && new Date(departsAt).getTime() + minutes * 60_000 < Date.now()
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
  direction: TripDirection
}

export async function getCommunityTrips(
  code: string,
  coords?: { lat: number; lng: number },
  radiusKm = 10,
  direction: TripDirection = 'to_community',
): Promise<RideRow[]> {
  const { data, error } = await supabase.rpc('get_community_trips', {
    p_code: code,
    p_lat: coords?.lat ?? null,
    p_lng: coords?.lng ?? null,
    p_radius_km: radiusKm,
    p_direction: direction,
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
  departs_at: string | null
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
