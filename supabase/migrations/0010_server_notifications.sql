-- ============================================================
-- Convoy — notification hardening. The trip RPCs now create the notification
-- rows themselves (recipient + message derived server-side from the verified
-- relationship), so the client can no longer target arbitrary users.
-- Push delivery happens via a webhook on `notifications` INSERT (Edge Function).
-- Paste into Supabase Studio → SQL Editor and run.
-- ============================================================

-- Internal helper: drop a notification into a user's inbox.
create or replace function public._notify(p_user uuid, p_title text, p_body text, p_url text)
returns void language sql security definer set search_path = public as $$
  insert into public.notifications (user_id, title, body, url)
  values (p_user, p_title, p_body, p_url);
$$;

-- request_to_join → notify the host (only on a genuinely new request).
create or replace function public.request_to_join(p_code text, p_trip uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare v_ok boolean; v_host uuid; v_rider text;
begin
  select exists (
    select 1 from trips t join communities c on c.id = t.community_id
    where t.id = p_trip and lower(c.code) = lower(trim(p_code))
      and t.status = 'open' and t.host_id <> auth.uid() and t.seats_open > 0
  ) into v_ok;
  if not v_ok then raise exception 'This ride is no longer available.'; end if;

  insert into join_requests (trip_id, rider_id)
  values (p_trip, auth.uid())
  on conflict (trip_id, rider_id) do nothing;

  if found then
    select host_id into v_host from trips where id = p_trip;
    select nullif(trim(coalesce(first_name,'') || ' ' || coalesce(last_name,'')), '')
      into v_rider from profiles where id = auth.uid();
    perform public._notify(v_host, 'New ride request',
      coalesce(v_rider, 'Someone') || ' asked to join your ride.', '/my-trips');
  end if;
end; $$;

-- resolve_request → notify the rider of the decision.
create or replace function public.resolve_request(p_request uuid, p_action text)
returns void
language plpgsql security definer set search_path = public as $$
declare v_trip uuid; v_host uuid; v_current text; v_open int; v_rider uuid; v_dest text;
begin
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

  select c.name into v_dest from trips t join communities c on c.id = t.community_id where t.id = v_trip;
  if p_action = 'approved' then
    perform public._notify(v_rider, 'Ride request approved 🎉',
      'You''re confirmed for the ride to ' || coalesce(v_dest, 'your destination') || '.', '/my-trips');
  else
    perform public._notify(v_rider, 'Ride request declined',
      'Your request for the ride to ' || coalesce(v_dest, 'your destination') || ' wasn''t approved this time.', '/my-trips');
  end if;
end; $$;

-- cancel_trip → notify approved riders; now returns void.
drop function if exists public.cancel_trip(uuid);
create function public.cancel_trip(p_trip uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare v_host uuid; v_status text; v_dest text;
begin
  select host_id, status into v_host, v_status from trips where id = p_trip;
  if v_host is null or v_host <> auth.uid() then raise exception 'Not authorised'; end if;
  if v_status <> 'open' then return; end if;

  update trips set status = 'cancelled' where id = p_trip;

  select c.name into v_dest from trips t join communities c on c.id = t.community_id where t.id = p_trip;
  insert into notifications (user_id, title, body, url)
  select jr.rider_id, 'Ride cancelled',
         'The host cancelled the ride to ' || coalesce(v_dest, 'your destination') || '.', '/my-trips'
  from join_requests jr where jr.trip_id = p_trip and jr.status = 'approved';
end; $$;
grant execute on function public.cancel_trip(uuid) to authenticated;

-- withdraw_request → notify the host; now returns void.
drop function if exists public.withdraw_request(uuid);
create function public.withdraw_request(p_trip uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare v_status text; v_host uuid; v_rider text;
begin
  select status into v_status from join_requests where trip_id = p_trip and rider_id = auth.uid();
  if v_status is null then return; end if;

  if v_status = 'approved' then
    update trips set seats_open = least(seats_open + 1, seats_total) where id = p_trip;
  end if;

  delete from join_requests where trip_id = p_trip and rider_id = auth.uid();

  select host_id into v_host from trips where id = p_trip;
  select nullif(trim(coalesce(first_name,'') || ' ' || coalesce(last_name,'')), '')
    into v_rider from profiles where id = auth.uid();

  if v_status = 'approved' then
    perform public._notify(v_host, 'A rider left your ride',
      coalesce(v_rider, 'A rider') || ' can no longer make the ride.', '/my-trips');
  else
    perform public._notify(v_host, 'Request withdrawn',
      coalesce(v_rider, 'A rider') || ' withdrew their request.', '/my-trips');
  end if;
end; $$;
grant execute on function public.withdraw_request(uuid) to authenticated;

-- complete_trip → also notify approved riders the ride was confirmed.
create or replace function public.complete_trip(p_trip uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_host uuid; v_status text; v_dest text;
begin
  select host_id, status into v_host, v_status from trips where id = p_trip;
  if v_host is null or v_host <> auth.uid() then raise exception 'Not authorised'; end if;
  if v_status <> 'open' then return; end if;

  update trips set status = 'completed' where id = p_trip;
  update profiles set rides_completed = rides_completed + 1 where id = v_host;
  update profiles set rides_completed = rides_completed + 1
   where id in (select rider_id from join_requests where trip_id = p_trip and status = 'approved');

  select c.name into v_dest from trips t join communities c on c.id = t.community_id where t.id = p_trip;
  insert into notifications (user_id, title, body, url)
  select jr.rider_id, 'Ride completed',
         'Your ride to ' || coalesce(v_dest, 'your destination') || ' was confirmed. Added to your rides.', '/profile'
  from join_requests jr where jr.trip_id = p_trip and jr.status = 'approved';
end; $$;
grant execute on function public.complete_trip(uuid) to authenticated;
