-- ============================================================
-- Convoy — enforce suspension at the database level. A suspended member
-- (profiles.suspended = true, set from the admin dashboard) can still sign in
-- and browse, but cannot post rides, request to join, or approve requests.
-- Enforced in the security-definer RPCs AND in the RLS insert policies so it
-- holds no matter which path a client takes. Paste into Supabase SQL Editor.
-- ============================================================

-- Helper: is the calling user suspended? (security definer so it reads the flag
-- regardless of the profiles RLS policy).
create or replace function public.current_user_suspended()
returns boolean language sql security definer set search_path = public stable as $$
  select coalesce((select suspended from public.profiles where id = auth.uid()), false);
$$;
grant execute on function public.current_user_suspended() to authenticated;

-- ── Block posting a ride: tighten the trips insert policy ──
drop policy if exists "trips_insert_own" on public.trips;
create policy "trips_insert_own" on public.trips
  for insert with check (host_id = auth.uid() and not public.current_user_suspended());

-- ── Block requesting to join via direct insert (defense in depth) ──
drop policy if exists "requests_insert_own" on public.join_requests;
create policy "requests_insert_own" on public.join_requests
  for insert with check (rider_id = auth.uid() and not public.current_user_suspended());

-- ── Block requesting to join via the RPC ──
create or replace function public.request_to_join(p_code text, p_trip uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare v_ok boolean; v_host uuid; v_rider text;
begin
  if public.current_user_suspended() then
    raise exception 'Your account is suspended. Please contact your community admin.';
  end if;

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

-- ── Block a suspended host from approving/declining requests ──
create or replace function public.resolve_request(p_request uuid, p_action text)
returns void
language plpgsql security definer set search_path = public as $$
declare v_trip uuid; v_host uuid; v_current text; v_open int; v_rider uuid; v_dest text;
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

  select c.name into v_dest from trips t join communities c on c.id = t.community_id where t.id = v_trip;
  if p_action = 'approved' then
    perform public._notify(v_rider, 'Ride request approved 🎉',
      'You''re confirmed for the ride to ' || coalesce(v_dest, 'your destination') || '.', '/my-trips');
  else
    perform public._notify(v_rider, 'Ride request declined',
      'Your request for the ride to ' || coalesce(v_dest, 'your destination') || ' wasn''t approved this time.', '/my-trips');
  end if;
end; $$;
