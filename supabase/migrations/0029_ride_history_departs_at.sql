-- Add departs_at to ride history so the profile can tell past rides from
-- upcoming ones (a joined ride is "done" for the guest once it has departed,
-- even before the host confirms it).
drop function if exists public.get_ride_history();

create or replace function public.get_ride_history()
returns table (
  trip_id uuid,
  role text,            -- 'offered' | 'joined'
  counterpart text,     -- the host's name (for joined rides); null for offered
  destination text,     -- community name
  pickup_point text,
  depart_date date,
  departs_at timestamptz,
  status text           -- 'open' | 'completed' | 'cancelled'
)
language sql security definer set search_path = public stable as $$
  -- Rides you offered
  select t.id, 'offered'::text, null::text,
         c.name, t.pickup_point, t.depart_date, t.departs_at, t.status
  from trips t
  join communities c on c.id = t.community_id
  where t.host_id = auth.uid()

  union all

  -- Rides you joined and were approved for
  select t.id, 'joined'::text,
         nullif(trim(coalesce(hp.first_name,'') || ' ' || coalesce(hp.last_name,'')), ''),
         c.name, t.pickup_point, t.depart_date, t.departs_at, t.status
  from join_requests jr
  join trips t      on t.id = jr.trip_id
  join communities c on c.id = t.community_id
  join profiles hp   on hp.id = t.host_id
  where jr.rider_id = auth.uid() and jr.status = 'approved'

  order by depart_date desc;
$$;

grant execute on function public.get_ride_history() to authenticated;
