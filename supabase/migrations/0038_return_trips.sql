-- ============================================================
-- Veesaa: return trips.
--
-- A community code identifies the SHARED PLACE, not strictly the destination.
-- A trip is either heading `to_community` or `from_community`.
--
-- The key insight: pickup_point/lat/lng never really meant "pickup". It means
-- THE MEMBER-SIDE POINT, the end near people's homes (the community is always
-- the other end). On a return that same point is where riders are dropped off.
-- So matching, seats, requests, approval, cancellation all work unchanged, and
-- the whole feature is one enum column.
--
-- Paste into Supabase Studio -> SQL Editor and run.
-- ============================================================

-- ── 1. Direction on trips, plus an optional link to the outbound it mirrors ──
alter table public.trips
  add column if not exists direction text not null default 'to_community'
    check (direction in ('to_community', 'from_community'));
alter table public.trips
  add column if not exists paired_trip_id uuid references public.trips (id) on delete set null;

create index if not exists trips_direction_idx on public.trips (community_id, direction, status);

-- ── 2. Direction on ride_wants, so return demand is not invisible ──
alter table public.ride_wants
  add column if not exists direction text not null default 'to_community'
    check (direction in ('to_community', 'from_community'));

-- ── 3. Nudge dedupe: a rider is told about a given return exactly once ──
-- Two different events can make the nudge due (see below), so this is what
-- keeps "notify once" true.
create table if not exists public.return_nudges (
  return_trip_id uuid not null references public.trips (id) on delete cascade,
  user_id        uuid not null references public.profiles (id) on delete cascade,
  created_at     timestamptz not null default now(),
  primary key (return_trip_id, user_id)
);
alter table public.return_nudges enable row level security;
-- No policies on purpose: internal only, written by the security-definer triggers.

create or replace function public._nudge_return(p_return_trip uuid, p_rider uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare v_host text; v_time text; v_ins int;
begin
  insert into public.return_nudges (return_trip_id, user_id)
  values (p_return_trip, p_rider)
  on conflict do nothing;
  get diagnostics v_ins = row_count;
  if v_ins = 0 then return; end if;   -- already nudged, stay quiet

  select nullif(trim(coalesce(hp.first_name, '') || ' ' || coalesce(hp.last_name, '')), ''), t.depart_time
    into v_host, v_time
  from public.trips t
  join public.profiles hp on hp.id = t.host_id
  where t.id = p_return_trip;

  perform public._notify(
    p_rider,
    'Your host is driving back',
    coalesce(v_host, 'Your host') || ' is also driving back at ' || coalesce(v_time, 'a set time')
      || '. Request a seat.',
    '/find/community'
  );
end; $$;

-- ── 4. The nudge fires the moment BOTH facts are true: the rider is approved on
-- the outbound, AND a return by that host exists. Those become true in either
-- order, so both events are covered. It is computed from "riders this host
-- carried out", never from paired_trip_id, so a host who skips the checkbox and
-- posts a standalone return still notifies her riders.

-- 4a. Return posted when riders already exist (standalone, or a late opt-in).
create or replace function public.nudge_on_return_posted()
returns trigger
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  if new.direction <> 'from_community' or new.status <> 'open' then return new; end if;

  for r in
    select distinct jr.rider_id
    from public.trips ob
    join public.join_requests jr on jr.trip_id = ob.id and jr.status = 'approved'
    where ob.host_id = new.host_id
      and ob.community_id = new.community_id
      and ob.direction = 'to_community'
      and ob.depart_date = new.depart_date
      and ob.status <> 'cancelled'
      and jr.rider_id <> new.host_id
  loop
    perform public._nudge_return(new.id, r.rider_id);
  end loop;
  return new;
end; $$;

drop trigger if exists trips_nudge_return_posted on public.trips;
create trigger trips_nudge_return_posted
  after insert on public.trips
  for each row execute function public.nudge_on_return_posted();

-- 4b. Return already exists and a rider is approved later (the checkbox path:
-- at creation the outbound has no riders yet, so this is the case that matters).
create or replace function public.nudge_on_outbound_approved()
returns trigger
language plpgsql security definer set search_path = public as $$
declare v_host uuid; v_comm uuid; v_date date; v_dir text; v_return uuid;
begin
  if new.status <> 'approved' or old.status = 'approved' then return new; end if;

  select t.host_id, t.community_id, t.depart_date, t.direction
    into v_host, v_comm, v_date, v_dir
  from public.trips t where t.id = new.trip_id;

  if v_dir is distinct from 'to_community' then return new; end if;

  select t.id into v_return
  from public.trips t
  where t.host_id = v_host
    and t.community_id = v_comm
    and t.direction = 'from_community'
    and t.depart_date = v_date
    and t.status = 'open'
  order by t.depart_time
  limit 1;

  if v_return is not null then
    perform public._nudge_return(v_return, new.rider_id);
  end if;
  return new;
end; $$;

drop trigger if exists join_requests_nudge_return on public.join_requests;
create trigger join_requests_nudge_return
  after update on public.join_requests
  for each row execute function public.nudge_on_outbound_approved();

-- ── 5. Browsing is direction-aware ──
drop function if exists public.get_community_trips(text, double precision, double precision, double precision);
drop function if exists public.get_community_trips(text, double precision, double precision, double precision, text);
create function public.get_community_trips(
  p_code text,
  p_lat double precision default null,
  p_lng double precision default null,
  p_radius_km double precision default 10,
  p_direction text default 'to_community'
)
returns table (
  id uuid, host_id uuid, host_name text, host_photo text, host_rides int,
  community_name text, area text,
  depart_date date, depart_time text,
  pickup_point text, pickup_note text,
  vehicle text, color text, color_hex text,
  seats_total int, seats_open int,
  already_requested boolean,
  distance_km double precision,
  direction text
)
language sql security definer set search_path = public stable as $$
  select t.id, t.host_id,
         nullif(trim(coalesce(hp.first_name,'') || ' ' || coalesce(hp.last_name,'')), ''),
         hp.photo_url, hp.rides_completed,
         c.name, c.area,
         t.depart_date, t.depart_time, t.pickup_point, t.pickup_note,
         t.vehicle, t.color, t.color_hex, t.seats_total, t.seats_open,
         exists (select 1 from join_requests jr where jr.trip_id = t.id and jr.rider_id = auth.uid()),
         case
           when p_lat is not null and t.pickup_lat is not null
           then round((earth_distance(ll_to_earth(t.pickup_lat, t.pickup_lng), ll_to_earth(p_lat, p_lng)) / 1000.0)::numeric, 1)::double precision
           else null
         end,
         t.direction
  from trips t
  join communities c on c.id = t.community_id
  join profiles hp on hp.id = t.host_id
  where lower(c.code) = lower(trim(p_code))
    and t.direction = coalesce(p_direction, 'to_community')
    and t.status = 'open'
    and t.host_id <> auth.uid()
    and t.seats_open > 0
    and (t.departs_at is null or t.departs_at > now())
    and (
      p_lat is null or p_lng is null            -- no rider location -> show all
      or t.pickup_lat is null                   -- ride has no coords -> don't hide it
      or earth_distance(ll_to_earth(t.pickup_lat, t.pickup_lng), ll_to_earth(p_lat, p_lng)) <= p_radius_km * 1000
    )
  order by
    case
      when p_lat is not null and t.pickup_lat is not null
      then earth_distance(ll_to_earth(t.pickup_lat, t.pickup_lng), ll_to_earth(p_lat, p_lng))
      else null
    end asc nulls last,
    t.depart_date, t.depart_time;
$$;
grant execute on function public.get_community_trips(text, double precision, double precision, double precision, text) to authenticated;

-- ── 6. Demand signal records direction too ──
drop function if exists public.record_ride_want(text, text, double precision, double precision, int);
create function public.record_ride_want(
  p_code text,
  p_place text,
  p_lat double precision,
  p_lng double precision,
  p_results int,
  p_direction text default 'to_community'
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_comm uuid; v_id uuid; v_recent int; v_dir text;
begin
  v_dir := coalesce(p_direction, 'to_community');

  select id into v_comm from public.communities
   where lower(code) = lower(trim(p_code)) limit 1;
  if v_comm is null then
    raise exception 'That community code could not be found.';
  end if;

  -- Reuse a recent want for the same community AND direction.
  select id into v_id from public.ride_wants
   where user_id = auth.uid() and community_id = v_comm and direction = v_dir
     and created_at > now() - interval '10 minutes'
   order by created_at desc limit 1;

  if v_id is not null then
    update public.ride_wants
       set starting_place = coalesce(p_place, starting_place),
           start_lat = coalesce(p_lat, start_lat),
           start_lng = coalesce(p_lng, start_lng),
           results_count = p_results
     where id = v_id;
    return v_id;
  end if;

  select count(*) into v_recent from public.ride_wants
   where user_id = auth.uid() and created_at > now() - interval '1 hour';
  if v_recent >= 30 then
    raise exception 'Too many searches. Please try again later.'
      using errcode = 'check_violation';
  end if;

  insert into public.ride_wants (user_id, community_id, code, starting_place, start_lat, start_lng, results_count, direction)
  values (auth.uid(), v_comm, trim(p_code), p_place, p_lat, p_lng, p_results, v_dir)
  returning id into v_id;
  return v_id;
end; $$;
revoke execute on function public.record_ride_want(text, text, double precision, double precision, int, text) from anon, public;
grant execute on function public.record_ride_want(text, text, double precision, double precision, int, text) to authenticated;

-- ── 7. A new ride only notifies wants going the SAME way ──
create or replace function public.notify_ride_wants()
returns trigger
language plpgsql security definer set search_path = public as $$
declare r record; v_dest text;
begin
  if new.status <> 'open' then return new; end if;

  select name into v_dest from public.communities where id = new.community_id;

  for r in
    select w.id, w.user_id
      from public.ride_wants w
     where w.community_id = new.community_id
       and w.direction = new.direction          -- never tell someone about the wrong way
       and w.status = 'open'
       and w.wants_notify
       and w.user_id <> new.host_id
       and w.created_at > now() - interval '30 days'
       and (
         w.start_lat is null or new.pickup_lat is null
         or earth_distance(ll_to_earth(w.start_lat, w.start_lng),
                           ll_to_earth(new.pickup_lat, new.pickup_lng)) <= 25000
       )
  loop
    perform public._notify(
      r.user_id,
      'A ride just opened up',
      case when new.direction = 'from_community'
        then 'Someone is heading back from ' || coalesce(v_dest, 'your community') || '. Grab a seat.'
        else 'Someone from ' || coalesce(v_dest, 'your community') || ' is heading your way. Grab a seat.'
      end,
      '/find/community'
    );
    update public.ride_wants
       set status = 'fulfilled', notified_at = now()
     where id = r.id;
  end loop;

  return new;
end; $$;

-- ── 8. My Trips surfaces direction ──
drop function if exists public.get_my_trips();
create function public.get_my_trips()
returns table (
  id uuid, community_name text, area text, community_logo text,
  depart_date date, depart_time text, departs_at timestamptz,
  pickup_point text, pickup_note text,
  vehicle text, color_hex text,
  seats_total int, seats_open int, status text,
  pending_count bigint, direction text
)
language sql security definer set search_path = public stable as $$
  select t.id, c.name, c.area, c.logo_url, t.depart_date, t.depart_time, t.departs_at,
         t.pickup_point, t.pickup_note, t.vehicle, t.color_hex,
         t.seats_total, t.seats_open, t.status,
         (select count(*) from join_requests jr where jr.trip_id = t.id and jr.status = 'pending'),
         t.direction
  from trips t
  join communities c on c.id = t.community_id
  where t.host_id = auth.uid()
  order by t.departs_at desc nulls last, t.depart_date desc;
$$;
grant execute on function public.get_my_trips() to authenticated;

drop function if exists public.get_trip_detail(uuid);
create function public.get_trip_detail(p_trip uuid)
returns table (
  id uuid, community_name text, area text, community_logo text,
  depart_date date, depart_time text, departs_at timestamptz,
  pickup_point text, pickup_note text,
  vehicle text, color_hex text,
  seats_total int, seats_open int, status text,
  pending_count bigint, direction text
)
language sql security definer set search_path = public stable as $$
  select t.id, c.name, c.area, c.logo_url, t.depart_date, t.depart_time, t.departs_at,
         t.pickup_point, t.pickup_note, t.vehicle, t.color_hex,
         t.seats_total, t.seats_open, t.status,
         (select count(*) from join_requests jr where jr.trip_id = t.id and jr.status = 'pending'),
         t.direction
  from trips t
  join communities c on c.id = t.community_id
  where t.id = p_trip and t.host_id = auth.uid();
$$;
grant execute on function public.get_trip_detail(uuid) to authenticated;

drop function if exists public.get_my_joined_trips();
create function public.get_my_joined_trips()
returns table (
  trip_id uuid, host_name text, host_photo text, host_rides int, host_phone text,
  community_name text, area text, community_logo text,
  depart_date date, depart_time text, departs_at timestamptz,
  pickup_point text, pickup_note text,
  vehicle text, color_hex text, status text, direction text
)
language sql security definer set search_path = public stable as $$
  select t.id,
         nullif(trim(coalesce(hp.first_name,'') || ' ' || coalesce(hp.last_name,'')), ''),
         hp.photo_url, hp.rides_completed, hp.phone,
         c.name, c.area, c.logo_url,
         t.depart_date, t.depart_time, t.departs_at,
         t.pickup_point, t.pickup_note, t.vehicle, t.color_hex, t.status, t.direction
  from join_requests jr
  join trips t       on t.id = jr.trip_id
  join communities c on c.id = t.community_id
  join profiles hp   on hp.id = t.host_id
  where jr.rider_id = auth.uid() and jr.status = 'approved'
  order by t.departs_at desc nulls last, t.depart_date desc;
$$;
grant execute on function public.get_my_joined_trips() to authenticated;

-- Internal only.
revoke execute on function public._nudge_return(uuid, uuid) from anon, public, authenticated;
revoke execute on function public.nudge_on_return_posted() from anon, public, authenticated;
revoke execute on function public.nudge_on_outbound_approved() from anon, public, authenticated;
