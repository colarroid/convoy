-- ============================================================
-- Convoy — My Trips: host-facing reads/writes.
-- Security-definer functions so a host can see community names and the
-- (limited) profile info of riders who requested their trip — which plain
-- RLS deliberately hides. Each function checks auth.uid() ownership.
-- Paste into Supabase Studio → SQL Editor and run.
-- ============================================================

-- All trips the current user hosts, with community + pending count.
create or replace function public.get_my_trips()
returns table (
  id uuid, community_name text, area text,
  depart_date date, depart_time text,
  pickup_point text, pickup_note text,
  vehicle text, color_hex text,
  seats_total int, seats_open int, status text,
  pending_count bigint
)
language sql security definer set search_path = public stable as $$
  select t.id, c.name, c.area, t.depart_date, t.depart_time,
         t.pickup_point, t.pickup_note, t.vehicle, t.color_hex,
         t.seats_total, t.seats_open, t.status,
         (select count(*) from join_requests jr where jr.trip_id = t.id and jr.status = 'pending')
  from trips t
  join communities c on c.id = t.community_id
  where t.host_id = auth.uid()
  order by t.depart_date, t.depart_time;
$$;

-- A single trip the caller hosts (same shape as above).
create or replace function public.get_trip_detail(p_trip uuid)
returns table (
  id uuid, community_name text, area text,
  depart_date date, depart_time text,
  pickup_point text, pickup_note text,
  vehicle text, color_hex text,
  seats_total int, seats_open int, status text,
  pending_count bigint
)
language sql security definer set search_path = public stable as $$
  select t.id, c.name, c.area, t.depart_date, t.depart_time,
         t.pickup_point, t.pickup_note, t.vehicle, t.color_hex,
         t.seats_total, t.seats_open, t.status,
         (select count(*) from join_requests jr where jr.trip_id = t.id and jr.status = 'pending')
  from trips t
  join communities c on c.id = t.community_id
  where t.id = p_trip and t.host_id = auth.uid();
$$;

-- Requests on a trip the caller hosts, with limited rider info.
-- p_status filters (e.g. 'pending' or 'approved'); null = all.
create or replace function public.get_trip_requests(p_trip uuid, p_status text default null)
returns table (
  request_id uuid, status text, rider_id uuid,
  rider_name text, rider_photo text, rider_rides int,
  created_at timestamptz
)
language sql security definer set search_path = public stable as $$
  select jr.id, jr.status, p.id,
         nullif(trim(coalesce(p.first_name,'') || ' ' || coalesce(p.last_name,'')), ''),
         p.photo_url, p.rides_completed, jr.created_at
  from join_requests jr
  join trips t on t.id = jr.trip_id
  join profiles p on p.id = jr.rider_id
  where jr.trip_id = p_trip
    and t.host_id = auth.uid()
    and (p_status is null or jr.status = p_status)
  order by jr.created_at;
$$;

-- Host approves/declines a request (and frees/uses a seat on approval).
create or replace function public.resolve_request(p_request uuid, p_action text)
returns void
language plpgsql security definer set search_path = public as $$
declare v_trip uuid; v_host uuid; v_current text;
begin
  select t.id, t.host_id, jr.status into v_trip, v_host, v_current
  from join_requests jr
  join trips t on t.id = jr.trip_id
  where jr.id = p_request;

  if v_host is null or v_host <> auth.uid() then
    raise exception 'Not authorised';
  end if;
  if p_action not in ('approved', 'declined') then
    raise exception 'Invalid action';
  end if;

  update join_requests set status = p_action where id = p_request;

  -- Only decrement a seat when moving into 'approved' from a non-approved state.
  if p_action = 'approved' and v_current <> 'approved' then
    update trips set seats_open = greatest(seats_open - 1, 0) where id = v_trip;
  end if;
end;
$$;

grant execute on function public.get_my_trips()                     to authenticated;
grant execute on function public.get_trip_detail(uuid)             to authenticated;
grant execute on function public.get_trip_requests(uuid, text)     to authenticated;
grant execute on function public.resolve_request(uuid, text)       to authenticated;
