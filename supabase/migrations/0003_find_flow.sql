-- ============================================================
-- Convoy — Find flow: browse a community's open rides (with host info)
-- and request to join one. Both are code-gated security-definer functions.
-- Paste into Supabase Studio → SQL Editor and run.
-- ============================================================

-- Replace get_community_trips so it also returns host + community display
-- info, hides the caller's own rides and full rides, and flags rides the
-- caller has already requested. (Return type changes → must drop first.)
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
  order by t.depart_date, t.depart_time;
$$;

grant execute on function public.get_community_trips(text) to authenticated;

-- Rider requests to join a ride. Code-gated (you must know the community)
-- and validated server-side. Idempotent on (trip, rider).
create or replace function public.request_to_join(p_code text, p_trip uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare v_ok boolean;
begin
  select exists (
    select 1 from trips t join communities c on c.id = t.community_id
    where t.id = p_trip
      and lower(c.code) = lower(trim(p_code))
      and t.status = 'open'
      and t.host_id <> auth.uid()
      and t.seats_open > 0
  ) into v_ok;

  if not v_ok then
    raise exception 'This ride is no longer available.';
  end if;

  insert into join_requests (trip_id, rider_id)
  values (p_trip, auth.uid())
  on conflict (trip_id, rider_id) do nothing;
end;
$$;

grant execute on function public.request_to_join(text, uuid) to authenticated;
