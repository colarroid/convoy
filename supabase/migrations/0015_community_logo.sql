-- ============================================================
-- Convoy — community logo (replaces banner colour). Adds communities.logo_url
-- and returns it from every place a community is shown (offer/find entry, ride
-- details, my-trips). Paste into Supabase Studio → SQL Editor and run.
-- ============================================================

alter table public.communities add column if not exists logo_url text;

-- ── Find: include community logo ──
drop function if exists public.get_community_trips(text, double precision, double precision, double precision);
create function public.get_community_trips(
  p_code text,
  p_lat double precision default null,
  p_lng double precision default null,
  p_radius_km double precision default 10
)
returns table (
  id uuid, host_id uuid, host_name text, host_photo text, host_rides int,
  community_name text, area text, community_logo text,
  depart_date date, depart_time text,
  pickup_point text, pickup_note text,
  vehicle text, color text, color_hex text,
  seats_total int, seats_open int,
  already_requested boolean,
  distance_km double precision
)
language sql security definer set search_path = public stable as $$
  select t.id, t.host_id,
         nullif(trim(coalesce(hp.first_name,'') || ' ' || coalesce(hp.last_name,'')), ''),
         hp.photo_url, hp.rides_completed,
         c.name, c.area, c.logo_url,
         t.depart_date, t.depart_time, t.pickup_point, t.pickup_note,
         t.vehicle, t.color, t.color_hex, t.seats_total, t.seats_open,
         exists (select 1 from join_requests jr where jr.trip_id = t.id and jr.rider_id = auth.uid()),
         case
           when p_lat is not null and t.pickup_lat is not null
           then round((earth_distance(ll_to_earth(t.pickup_lat, t.pickup_lng), ll_to_earth(p_lat, p_lng)) / 1000.0)::numeric, 1)::double precision
           else null
         end
  from trips t
  join communities c on c.id = t.community_id
  join profiles hp on hp.id = t.host_id
  where lower(c.code) = lower(trim(p_code))
    and t.status = 'open'
    and t.host_id <> auth.uid()
    and t.seats_open > 0
    and (t.departs_at is null or t.departs_at > now())
    and (
      p_lat is null or p_lng is null
      or t.pickup_lat is null
      or earth_distance(ll_to_earth(t.pickup_lat, t.pickup_lng), ll_to_earth(p_lat, p_lng)) <= p_radius_km * 1000
    )
  order by
    case when p_lat is not null and t.pickup_lat is not null
      then earth_distance(ll_to_earth(t.pickup_lat, t.pickup_lng), ll_to_earth(p_lat, p_lng)) else null end asc nulls last,
    t.depart_date, t.depart_time;
$$;
grant execute on function public.get_community_trips(text, double precision, double precision, double precision) to authenticated;

-- ── My trips (host): include community logo ──
drop function if exists public.get_my_trips();
create function public.get_my_trips()
returns table (
  id uuid, community_name text, area text, community_logo text,
  depart_date date, depart_time text, departs_at timestamptz,
  pickup_point text, pickup_note text,
  vehicle text, color_hex text,
  seats_total int, seats_open int, status text,
  pending_count bigint
)
language sql security definer set search_path = public stable as $$
  select t.id, c.name, c.area, c.logo_url, t.depart_date, t.depart_time, t.departs_at,
         t.pickup_point, t.pickup_note, t.vehicle, t.color_hex,
         t.seats_total, t.seats_open, t.status,
         (select count(*) from join_requests jr where jr.trip_id = t.id and jr.status = 'pending')
  from trips t
  join communities c on c.id = t.community_id
  where t.host_id = auth.uid()
  order by t.departs_at desc nulls last, t.depart_date desc;
$$;
grant execute on function public.get_my_trips() to authenticated;

drop function if exists public.get_trip_detail(uuid);
create function public.get_trip_detail(p_trip uuid)
returns table (
  id uuid, community_name text, area text, community_logo text,
  depart_date date, depart_time text, departs_at timestamptz,
  pickup_point text, pickup_note text,
  vehicle text, color_hex text,
  seats_total int, seats_open int, status text,
  pending_count bigint
)
language sql security definer set search_path = public stable as $$
  select t.id, c.name, c.area, c.logo_url, t.depart_date, t.depart_time, t.departs_at,
         t.pickup_point, t.pickup_note, t.vehicle, t.color_hex,
         t.seats_total, t.seats_open, t.status,
         (select count(*) from join_requests jr where jr.trip_id = t.id and jr.status = 'pending')
  from trips t
  join communities c on c.id = t.community_id
  where t.id = p_trip and t.host_id = auth.uid();
$$;
grant execute on function public.get_trip_detail(uuid) to authenticated;

-- ── My trips (rider): include community logo ──
drop function if exists public.get_my_joined_trips();
create function public.get_my_joined_trips()
returns table (
  trip_id uuid, host_name text, host_photo text, host_rides int, host_phone text,
  community_name text, area text, community_logo text,
  depart_date date, depart_time text, departs_at timestamptz,
  pickup_point text, pickup_note text,
  vehicle text, color_hex text, status text
)
language sql security definer set search_path = public stable as $$
  select t.id,
         nullif(trim(coalesce(hp.first_name,'') || ' ' || coalesce(hp.last_name,'')), ''),
         hp.photo_url, hp.rides_completed, hp.phone,
         c.name, c.area, c.logo_url,
         t.depart_date, t.depart_time, t.departs_at,
         t.pickup_point, t.pickup_note, t.vehicle, t.color_hex, t.status
  from join_requests jr
  join trips t       on t.id = jr.trip_id
  join communities c on c.id = t.community_id
  join profiles hp   on hp.id = t.host_id
  where jr.rider_id = auth.uid() and jr.status = 'approved'
  order by t.departs_at desc nulls last, t.depart_date desc;
$$;
grant execute on function public.get_my_joined_trips() to authenticated;
