-- ============================================================
-- Convoy — share phone numbers for coordination once a ride is matched.
-- A rider gets the host's number for rides they're approved on; a host gets
-- an approved guest's number. Numbers are NOT exposed for pending requests.
-- Paste into Supabase Studio → SQL Editor and run.
-- ============================================================

-- Joined trips now include the host's phone (rider is already approved here).
drop function if exists public.get_my_joined_trips();
create function public.get_my_joined_trips()
returns table (
  trip_id uuid, host_name text, host_photo text, host_rides int, host_phone text,
  community_name text, area text,
  depart_date date, depart_time text, departs_at timestamptz,
  pickup_point text, pickup_note text,
  vehicle text, color_hex text, status text
)
language sql security definer set search_path = public stable as $$
  select t.id,
         nullif(trim(coalesce(hp.first_name,'') || ' ' || coalesce(hp.last_name,'')), ''),
         hp.photo_url, hp.rides_completed, hp.phone,
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

-- Trip requests now include the rider's phone, but ONLY for approved guests.
drop function if exists public.get_trip_requests(uuid, text);
create function public.get_trip_requests(p_trip uuid, p_status text default null)
returns table (
  request_id uuid, status text, rider_id uuid,
  rider_name text, rider_photo text, rider_rides int, rider_phone text,
  created_at timestamptz
)
language sql security definer set search_path = public stable as $$
  select jr.id, jr.status, p.id,
         nullif(trim(coalesce(p.first_name,'') || ' ' || coalesce(p.last_name,'')), ''),
         p.photo_url, p.rides_completed,
         case when jr.status = 'approved' then p.phone else null end,
         jr.created_at
  from join_requests jr
  join trips t    on t.id = jr.trip_id
  join profiles p on p.id = jr.rider_id
  where jr.trip_id = p_trip
    and t.host_id = auth.uid()
    and (p_status is null or jr.status = p_status)
  order by jr.created_at;
$$;
grant execute on function public.get_trip_requests(uuid, text) to authenticated;
