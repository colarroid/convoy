-- Optional cancellation reason: included in the notification/email to passengers
-- and recorded in trip_feedback so admins can see why a ride was cancelled.
drop function if exists public.cancel_trip(uuid);

create or replace function public.cancel_trip(p_trip uuid, p_reason text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare v_host uuid; v_status text; v_dest text; v_reason text;
begin
  select host_id, status into v_host, v_status from trips where id = p_trip;
  if v_host is null or v_host <> auth.uid() then raise exception 'Not authorised'; end if;
  if v_status not in ('open', 'full') then return; end if;

  v_reason := nullif(btrim(coalesce(p_reason, '')), '');

  update trips set status = 'cancelled' where id = p_trip;

  -- Record the reason for the admin (reuses the trip_feedback table).
  if v_reason is not null then
    insert into trip_feedback (trip_id, host_id, reason) values (p_trip, auth.uid(), v_reason);
  end if;

  select c.name into v_dest from trips t join communities c on c.id = t.community_id where t.id = p_trip;
  insert into notifications (user_id, title, body, url)
  select jr.rider_id, 'Ride cancelled',
         'The host cancelled the ride to ' || coalesce(v_dest, 'your destination') || '.'
           || case when v_reason is not null then ' Reason: ' || v_reason else '' end,
         '/my-trips'
  from join_requests jr
  where jr.trip_id = p_trip and jr.status in ('approved', 'pending');
end; $$;

revoke execute on function public.cancel_trip(uuid, text) from public;
grant execute on function public.cancel_trip(uuid, text) to authenticated;
