-- ============================================================
-- Convoy — trip lifecycle: departure timestamp, auto-inactive past rides,
-- host completion (credits rides_completed), and rider-side "joined" trips.
-- Paste into Supabase Studio → SQL Editor and run.
-- ============================================================

-- A real timestamp for the departure so we can compare against now().
alter table public.trips add column if not exists departs_at timestamptz;

-- Best-effort backfill of existing rows from date + "h:mm AM" text.
update public.trips
set departs_at = to_timestamp(depart_date::text || ' ' || depart_time, 'YYYY-MM-DD HH12:MI AM')
where departs_at is null and depart_time ~ '^[0-9]';

-- ── Find: only show upcoming, open, non-full rides that aren't yours ──
drop function if exists public.get_community_trips(text);
create function public.get_community_trips(p_code text)
returns table (
  id uuid, host_id uuid, host_name text, host_photo text, host_rides int,
  community_name text, area text,
  depart_date date, depart_time text,
  pickup_point text, pickup_note text,
  vehicle text, color text, color_hex text,
  seats_total int, seats_open int,
  already_requested boolean
)
language sql security definer set search_path = public stable as $$
  select t.id, t.host_id,
         nullif(trim(coalesce(hp.first_name,'') || ' ' || coalesce(hp.last_name,'')), ''),
         hp.photo_url, hp.rides_completed,
         c.name, c.area,
         t.depart_date, t.depart_time, t.pickup_point, t.pickup_note,
         t.vehicle, t.color, t.color_hex, t.seats_total, t.seats_open,
         exists (select 1 from join_requests jr where jr.trip_id = t.id and jr.rider_id = auth.uid())
  from trips t
  join communities c on c.id = t.community_id
  join profiles hp on hp.id = t.host_id
  where lower(c.code) = lower(trim(p_code))
    and t.status = 'open'
    and t.host_id <> auth.uid()
    and t.seats_open > 0
    and (t.departs_at is null or t.departs_at > now())
  order by t.depart_date, t.depart_time;
$$;
grant execute on function public.get_community_trips(text) to authenticated;

-- ── My Trips (host): add departs_at so the UI can tell upcoming vs past ──
drop function if exists public.get_my_trips();
create function public.get_my_trips()
returns table (
  id uuid, community_name text, area text,
  depart_date date, depart_time text, departs_at timestamptz,
  pickup_point text, pickup_note text,
  vehicle text, color_hex text,
  seats_total int, seats_open int, status text,
  pending_count bigint
)
language sql security definer set search_path = public stable as $$
  select t.id, c.name, c.area, t.depart_date, t.depart_time, t.departs_at,
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
  id uuid, community_name text, area text,
  depart_date date, depart_time text, departs_at timestamptz,
  pickup_point text, pickup_note text,
  vehicle text, color_hex text,
  seats_total int, seats_open int, status text,
  pending_count bigint
)
language sql security definer set search_path = public stable as $$
  select t.id, c.name, c.area, t.depart_date, t.depart_time, t.departs_at,
         t.pickup_point, t.pickup_note, t.vehicle, t.color_hex,
         t.seats_total, t.seats_open, t.status,
         (select count(*) from join_requests jr where jr.trip_id = t.id and jr.status = 'pending')
  from trips t
  join communities c on c.id = t.community_id
  where t.id = p_trip and t.host_id = auth.uid();
$$;
grant execute on function public.get_trip_detail(uuid) to authenticated;

-- ── My Trips (rider): rides you've been approved to join ──
create or replace function public.get_my_joined_trips()
returns table (
  trip_id uuid, host_name text, host_photo text, host_rides int,
  community_name text, area text,
  depart_date date, depart_time text, departs_at timestamptz,
  pickup_point text, pickup_note text,
  vehicle text, color_hex text, status text
)
language sql security definer set search_path = public stable as $$
  select t.id,
         nullif(trim(coalesce(hp.first_name,'') || ' ' || coalesce(hp.last_name,'')), ''),
         hp.photo_url, hp.rides_completed,
         c.name, c.area,
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

-- ── Host marks a trip completed → credits everyone's ride count ──
create or replace function public.complete_trip(p_trip uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_host uuid; v_status text;
begin
  select host_id, status into v_host, v_status from trips where id = p_trip;
  if v_host is null or v_host <> auth.uid() then raise exception 'Not authorised'; end if;
  if v_status <> 'open' then return; end if;

  update trips set status = 'completed' where id = p_trip;

  update profiles set rides_completed = rides_completed + 1 where id = v_host;
  update profiles set rides_completed = rides_completed + 1
   where id in (select rider_id from join_requests where trip_id = p_trip and status = 'approved');
end; $$;
grant execute on function public.complete_trip(uuid) to authenticated;

-- ── Host cancels a trip (upcoming) or marks "didn't happen" (past) ──
create or replace function public.cancel_trip(p_trip uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_host uuid; v_status text;
begin
  select host_id, status into v_host, v_status from trips where id = p_trip;
  if v_host is null or v_host <> auth.uid() then raise exception 'Not authorised'; end if;
  if v_status <> 'open' then return; end if;
  update trips set status = 'cancelled' where id = p_trip;
end; $$;
grant execute on function public.cancel_trip(uuid) to authenticated;
