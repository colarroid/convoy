-- ============================================================
-- Veesaa: direction-aware notification copy.
--
-- Return trips (0038) are heading FROM the community, not to it, but the
-- approval / decline / cancel / complete notifications all said "the ride to
-- <community>". A rider who joined a ride home from church was told they were
-- "confirmed for the ride to The Hope Nation Church", which is backwards.
--
-- This adds a helper that phrases the trip relative to the community by
-- direction, and rewrites the four messages to use it.
-- Paste into Supabase Studio -> SQL Editor and run.
-- ============================================================

-- e.g. "ride to The Hope Nation Church"  /  "ride back from The Hope Nation Church"
create or replace function public.trip_place_phrase(p_direction text, p_name text)
returns text
language sql immutable as $$
  select case
    when coalesce(nullif(btrim(p_name), ''), '') = '' then
      case when p_direction = 'from_community' then 'ride home' else 'ride' end
    when p_direction = 'from_community' then 'ride back from ' || p_name
    else 'ride to ' || p_name
  end;
$$;

-- ── resolve_request: approve / decline ──
create or replace function public.resolve_request(p_request uuid, p_action text)
returns void
language plpgsql security definer set search_path = public as $$
declare v_trip uuid; v_host uuid; v_current text; v_open int; v_rider uuid; v_dest text; v_dir text; v_phrase text;
begin
  if public.current_user_suspended() then
    raise exception 'Your account is suspended. Please contact your community admin.';
  end if;

  select t.id, t.host_id, jr.status, t.seats_open, jr.rider_id
    into v_trip, v_host, v_current, v_open, v_rider
  from join_requests jr join trips t on t.id = jr.trip_id
  where jr.id = p_request;

  if v_host is null or v_host <> auth.uid() then raise exception 'Not authorised'; end if;
  if p_action not in ('approved', 'declined') then raise exception 'Invalid action'; end if;
  if v_current = p_action then return; end if;
  if p_action = 'approved' and v_current <> 'approved' and v_open <= 0 then
    raise exception 'No seats left on this ride.';
  end if;

  update join_requests set status = p_action where id = p_request;

  if p_action = 'approved' and v_current <> 'approved' then
    update trips set seats_open = greatest(seats_open - 1, 0) where id = v_trip;
  elsif p_action = 'declined' and v_current = 'approved' then
    update trips set seats_open = least(seats_open + 1, seats_total) where id = v_trip;
  end if;

  select c.name, t.direction into v_dest, v_dir
  from trips t join communities c on c.id = t.community_id where t.id = v_trip;
  v_phrase := public.trip_place_phrase(v_dir, v_dest);

  if p_action = 'approved' then
    perform public._notify(v_rider, 'Ride request approved 🎉',
      'You''re confirmed for the ' || v_phrase || '.', '/my-trips');
  else
    perform public._notify(v_rider, 'Ride request declined',
      'Your request for the ' || v_phrase || ' wasn''t approved this time.', '/my-trips');
  end if;
end; $$;

-- ── cancel_trip: notify approved + pending riders ──
create or replace function public.cancel_trip(p_trip uuid, p_reason text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare v_host uuid; v_status text; v_dest text; v_dir text; v_phrase text; v_reason text;
begin
  select host_id, status into v_host, v_status from trips where id = p_trip;
  if v_host is null or v_host <> auth.uid() then raise exception 'Not authorised'; end if;
  if v_status not in ('open', 'full') then return; end if;

  v_reason := nullif(btrim(coalesce(p_reason, '')), '');

  update trips set status = 'cancelled' where id = p_trip;

  if v_reason is not null then
    insert into trip_feedback (trip_id, host_id, reason) values (p_trip, auth.uid(), v_reason);
  end if;

  select c.name, t.direction into v_dest, v_dir
  from trips t join communities c on c.id = t.community_id where t.id = p_trip;
  v_phrase := public.trip_place_phrase(v_dir, v_dest);

  insert into notifications (user_id, title, body, url)
  select jr.rider_id, 'Ride cancelled',
         'The host cancelled the ' || v_phrase || '.'
           || case when v_reason is not null then ' Reason: ' || v_reason else '' end,
         '/my-trips'
  from join_requests jr
  where jr.trip_id = p_trip and jr.status in ('approved', 'pending');
end; $$;

-- ── complete_trip: notify approved riders ──
create or replace function public.complete_trip(p_trip uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_host uuid; v_status text; v_dest text; v_dir text; v_phrase text;
begin
  select host_id, status into v_host, v_status from trips where id = p_trip;
  if v_host is null or v_host <> auth.uid() then raise exception 'Not authorised'; end if;
  if v_status <> 'open' then return; end if;

  update trips set status = 'completed' where id = p_trip;
  update profiles set rides_completed = rides_completed + 1 where id = v_host;
  update profiles set rides_completed = rides_completed + 1
   where id in (select rider_id from join_requests where trip_id = p_trip and status = 'approved');

  select c.name, t.direction into v_dest, v_dir
  from trips t join communities c on c.id = t.community_id where t.id = p_trip;
  v_phrase := public.trip_place_phrase(v_dir, v_dest);

  insert into notifications (user_id, title, body, url)
  select jr.rider_id, 'Ride completed',
         'Your ' || v_phrase || ' was confirmed. Added to your rides.', '/profile'
  from join_requests jr where jr.trip_id = p_trip and jr.status = 'approved';
end; $$;

grant execute on function public.resolve_request(uuid, text) to authenticated;
grant execute on function public.cancel_trip(uuid, text) to authenticated;
grant execute on function public.complete_trip(uuid) to authenticated;
