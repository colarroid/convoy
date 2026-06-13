-- ============================================================
-- Convoy — cancellation + seat correctness.
--  • resolve_request: blocks approving past capacity, and properly
--    returns a seat if an approved rider is later declined.
--  • cancel_trip: host cancels a ride; returns affected approved riders.
--  • withdraw_request: a rider cancels their request / leaves a ride,
--    freeing a seat if they were approved; returns the host id.
-- Paste into Supabase Studio → SQL Editor and run.
-- ============================================================

create or replace function public.resolve_request(p_request uuid, p_action text)
returns void
language plpgsql security definer set search_path = public as $$
declare v_trip uuid; v_host uuid; v_current text; v_open int;
begin
  select t.id, t.host_id, jr.status, t.seats_open
    into v_trip, v_host, v_current, v_open
  from join_requests jr
  join trips t on t.id = jr.trip_id
  where jr.id = p_request;

  if v_host is null or v_host <> auth.uid() then raise exception 'Not authorised'; end if;
  if p_action not in ('approved', 'declined') then raise exception 'Invalid action'; end if;
  if v_current = p_action then return; end if;

  -- Capacity guard: can't approve when full.
  if p_action = 'approved' and v_current <> 'approved' and v_open <= 0 then
    raise exception 'No seats left on this ride.';
  end if;

  update join_requests set status = p_action where id = p_request;

  if p_action = 'approved' and v_current <> 'approved' then
    update trips set seats_open = greatest(seats_open - 1, 0) where id = v_trip;
  elsif p_action = 'declined' and v_current = 'approved' then
    update trips set seats_open = least(seats_open + 1, seats_total) where id = v_trip;
  end if;
end; $$;
grant execute on function public.resolve_request(uuid, text) to authenticated;

-- Host cancels a ride → returns the approved riders (so the client can notify).
drop function if exists public.cancel_trip(uuid);
create function public.cancel_trip(p_trip uuid)
returns table (rider_id uuid)
language plpgsql security definer set search_path = public as $$
declare v_host uuid; v_status text;
begin
  select host_id, status into v_host, v_status from trips where id = p_trip;
  if v_host is null or v_host <> auth.uid() then raise exception 'Not authorised'; end if;
  if v_status <> 'open' then return; end if;

  update trips set status = 'cancelled' where id = p_trip;

  return query
    select jr.rider_id from join_requests jr
    where jr.trip_id = p_trip and jr.status = 'approved';
end; $$;
grant execute on function public.cancel_trip(uuid) to authenticated;

-- Rider withdraws a request (pending) or leaves a ride (approved → frees a
-- seat). Returns the host id so the client can notify them.
create or replace function public.withdraw_request(p_trip uuid)
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_status text; v_host uuid;
begin
  select status into v_status from join_requests
  where trip_id = p_trip and rider_id = auth.uid();
  if v_status is null then return null; end if;

  if v_status = 'approved' then
    update trips set seats_open = least(seats_open + 1, seats_total) where id = p_trip;
  end if;

  delete from join_requests where trip_id = p_trip and rider_id = auth.uid();

  select host_id into v_host from trips where id = p_trip;
  return v_host;
end; $$;
grant execute on function public.withdraw_request(uuid) to authenticated;
