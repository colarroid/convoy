-- 1. cancel_trip: also notify PENDING (requested) riders, not just approved,
--    and allow cancelling a full trip. Notifications fan out to in-app + email
--    + push via the push-on-notification edge function.
create or replace function public.cancel_trip(p_trip uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare v_host uuid; v_status text; v_dest text;
begin
  select host_id, status into v_host, v_status from trips where id = p_trip;
  if v_host is null or v_host <> auth.uid() then raise exception 'Not authorised'; end if;
  if v_status not in ('open', 'full') then return; end if;

  update trips set status = 'cancelled' where id = p_trip;

  select c.name into v_dest from trips t join communities c on c.id = t.community_id where t.id = p_trip;
  insert into notifications (user_id, title, body, url)
  select jr.rider_id, 'Ride cancelled',
         'The host cancelled the ride to ' || coalesce(v_dest, 'your destination') || '.', '/my-trips'
  from join_requests jr
  where jr.trip_id = p_trip and jr.status in ('approved', 'pending');
end; $$;
grant execute on function public.cancel_trip(uuid) to authenticated;

-- 2. delete_trip: a host permanently removes one of their own CANCELLED trips.
create or replace function public.delete_trip(p_trip uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare v_host uuid; v_status text;
begin
  select host_id, status into v_host, v_status from trips where id = p_trip;
  if v_host is null or v_host <> auth.uid() then raise exception 'Not authorised'; end if;
  if v_status <> 'cancelled' then raise exception 'Only cancelled trips can be deleted'; end if;

  delete from trip_feedback where trip_id = p_trip;
  delete from join_requests where trip_id = p_trip;
  delete from trips where id = p_trip;
end; $$;
revoke execute on function public.delete_trip(uuid) from public;
grant execute on function public.delete_trip(uuid) to authenticated;

-- 3. forget_joined_trip: a rider removes a joined trip from their own list
--    (silently drops their join request; used for cancelled rides).
create or replace function public.forget_joined_trip(p_trip uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from join_requests where trip_id = p_trip and rider_id = auth.uid();
end; $$;
revoke execute on function public.forget_joined_trip(uuid) from public;
grant execute on function public.forget_joined_trip(uuid) to authenticated;
