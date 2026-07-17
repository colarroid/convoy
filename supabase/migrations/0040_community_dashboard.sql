-- ============================================================
-- Veesaa: community dashboard (community.veesaa.co).
--
-- Community owners self-serve: sign up, create a community (status 'pending'),
-- Veesaa approves it in the admin dashboard, and the owner gets a stats
-- dashboard (members who used the code, unmet demand, top areas).
--
-- Model notes:
--   - communities.status gates every code lookup: only 'active' codes resolve.
--     Existing rows default to 'active', so nothing changes for them.
--   - community_owners: one owner <-> one community (both columns unique).
--     Lifting the user_id uniqueness later IS the paid multi-community feature.
--   - Code changes are instant but cooled down (30 days). Rotating a code
--     already soft-revokes stored memberships (0021), which is exactly the
--     "members lose access until they re-enter" behaviour we warn about.
--   - Top areas come from a new `locality` column on trips and ride_wants,
--     captured forward-only from Places address components.
--
-- Paste into Supabase Studio -> SQL Editor and run.
-- ============================================================

-- ── 1. Columns ──
alter table public.communities
  add column if not exists status text not null default 'active'
    check (status in ('pending', 'active', 'rejected', 'suspended'));
alter table public.communities
  add column if not exists review_note text;
alter table public.communities
  add column if not exists code_changed_at timestamptz;

alter table public.trips      add column if not exists locality text;
alter table public.ride_wants add column if not exists locality text;

create index if not exists communities_status_idx on public.communities (status);

-- ── 2. Owners: one owner, one community ──
create table if not exists public.community_owners (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references public.profiles (id) on delete cascade,
  community_id uuid not null unique references public.communities (id) on delete cascade,
  created_at   timestamptz not null default now()
);
alter table public.community_owners enable row level security;
create policy "owners_select_own" on public.community_owners
  for select using (user_id = auth.uid());

-- ── 3. Only ACTIVE codes resolve, everywhere a code is checked ──

create or replace function public.get_community_by_code(p_code text)
returns public.communities
language sql security definer set search_path = public stable as $$
  select * from public.communities
  where lower(code) = lower(trim(p_code)) and status = 'active'
  limit 1;
$$;

-- get_community_trips: 0038 signature, plus the status filter.
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
    and c.status = 'active'
    and t.direction = coalesce(p_direction, 'to_community')
    and t.status = 'open'
    and t.host_id <> auth.uid()
    and t.seats_open > 0
    and (t.departs_at is null or t.departs_at > now())
    and (
      p_lat is null or p_lng is null
      or t.pickup_lat is null
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

create or replace function public.join_community_by_code(p_code text)
returns public.communities
language plpgsql security definer set search_path = public as $$
declare v_comm public.communities;
begin
  select * into v_comm from public.communities
  where lower(code) = lower(trim(p_code)) and status = 'active' limit 1;
  if v_comm.id is null then
    raise exception 'That community code could not be found.';
  end if;

  insert into public.community_members (user_id, community_id, code, status, last_used_at, revoked_at)
  values (auth.uid(), v_comm.id, v_comm.code, 'active', now(), null)
  on conflict (user_id, community_id) do update
    set code = excluded.code,
        status = 'active',
        last_used_at = now(),
        revoked_at = null;

  return v_comm;
end; $$;

create or replace function public.get_my_communities()
returns table (
  community_id uuid, code text, name text, area text, logo_url text,
  joined_at timestamptz, last_used_at timestamptz
)
language plpgsql security definer set search_path = public as $$
begin
  -- Soft-revoke memberships whose stored code no longer resolves to an ACTIVE
  -- community (rotated, retired, or the community was suspended).
  update public.community_members cm
    set status = 'revoked', revoked_at = now()
  where cm.user_id = auth.uid()
    and cm.status = 'active'
    and not exists (
      select 1 from public.communities c
      where lower(c.code) = lower(cm.code) and c.status = 'active'
    );

  return query
    select c.id, c.code, c.name, c.area, c.logo_url, cm.joined_at, cm.last_used_at
    from community_members cm
    join communities c on lower(c.code) = lower(cm.code) and c.status = 'active'
    where cm.user_id = auth.uid() and cm.status = 'active'
    order by cm.last_used_at desc;
end; $$;

-- request_to_join (0016 definition) with the status filter.
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
      and c.status = 'active'
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

-- Public directory only lists live communities.
drop function if exists public.list_public_communities();
create or replace function public.list_public_communities()
returns table (name text, area text, country text, logo_url text)
language sql security definer set search_path = public as $$
  select name, area, upper(country), logo_url
  from public.communities
  where country is not null and btrim(country) <> '' and status = 'active'
  order by upper(country), name
$$;
revoke execute on function public.list_public_communities() from public;
grant execute on function public.list_public_communities() to anon, authenticated;

-- record_ride_want: 0038 signature plus locality; community must be active.
drop function if exists public.record_ride_want(text, text, double precision, double precision, int, text);
create function public.record_ride_want(
  p_code text,
  p_place text,
  p_lat double precision,
  p_lng double precision,
  p_results int,
  p_direction text default 'to_community',
  p_locality text default null
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_comm uuid; v_id uuid; v_recent int; v_dir text;
begin
  v_dir := coalesce(p_direction, 'to_community');

  select id into v_comm from public.communities
   where lower(code) = lower(trim(p_code)) and status = 'active' limit 1;
  if v_comm is null then
    raise exception 'That community code could not be found.';
  end if;

  select id into v_id from public.ride_wants
   where user_id = auth.uid() and community_id = v_comm and direction = v_dir
     and created_at > now() - interval '10 minutes'
   order by created_at desc limit 1;

  if v_id is not null then
    update public.ride_wants
       set starting_place = coalesce(p_place, starting_place),
           start_lat = coalesce(p_lat, start_lat),
           start_lng = coalesce(p_lng, start_lng),
           locality = coalesce(p_locality, locality),
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

  insert into public.ride_wants (user_id, community_id, code, starting_place, start_lat, start_lng, results_count, direction, locality)
  values (auth.uid(), v_comm, trim(p_code), p_place, p_lat, p_lng, p_results, v_dir, p_locality)
  returning id into v_id;
  return v_id;
end; $$;
revoke execute on function public.record_ride_want(text, text, double precision, double precision, int, text, text) from anon, public;
grant execute on function public.record_ride_want(text, text, double precision, double precision, int, text, text) to authenticated;

-- ── 4. Owner RPCs ──

-- Case-insensitive availability across EVERY status (pending codes reserve too).
create or replace function public.is_code_available(p_code text)
returns boolean
language sql security definer set search_path = public stable as $$
  select not exists (
    select 1 from public.communities where lower(code) = lower(trim(p_code))
  );
$$;

create or replace function public._validate_community_code(p_code text)
returns text
language plpgsql as $$
declare v text;
begin
  v := upper(btrim(coalesce(p_code, '')));
  if v !~ '^[A-Z0-9][A-Z0-9-]{2,14}[A-Z0-9]$' or v like '%--%' then
    raise exception 'Codes are 4-16 characters: letters, numbers and single dashes.';
  end if;
  return v;
end; $$;

create or replace function public.create_my_community(
  p_name text, p_code text, p_address text, p_area text, p_country text
)
returns public.communities
language plpgsql security definer set search_path = public as $$
declare v_code text; v_comm public.communities;
begin
  if auth.uid() is null then raise exception 'Not signed in.'; end if;
  if exists (select 1 from community_owners where user_id = auth.uid()) then
    raise exception 'You already manage a community.';
  end if;
  if length(btrim(coalesce(p_name, ''))) < 3 then
    raise exception 'Please give your community a name.';
  end if;

  v_code := public._validate_community_code(p_code);
  if not public.is_code_available(v_code) then
    raise exception 'That code is already taken. Try another.';
  end if;

  insert into communities (code, name, address, area, country, status)
  values (v_code, btrim(p_name), nullif(btrim(coalesce(p_address,'')), ''), nullif(btrim(coalesce(p_area,'')), ''),
          nullif(lower(btrim(coalesce(p_country,''))), ''), 'pending')
  returning * into v_comm;

  insert into community_owners (user_id, community_id) values (auth.uid(), v_comm.id);
  return v_comm;
end; $$;

create or replace function public.get_my_owned_community()
returns public.communities
language sql security definer set search_path = public stable as $$
  select c.* from communities c
  join community_owners o on o.community_id = c.id
  where o.user_id = auth.uid()
  limit 1;
$$;

-- Details are editable; the code has its own path. Editing a rejected
-- community resubmits it for review.
create or replace function public.update_my_community(
  p_name text default null, p_address text default null, p_area text default null
)
returns public.communities
language plpgsql security definer set search_path = public as $$
declare v_comm public.communities;
begin
  select c.* into v_comm from communities c
  join community_owners o on o.community_id = c.id
  where o.user_id = auth.uid();
  if v_comm.id is null then raise exception 'You do not manage a community.'; end if;

  update communities set
    name    = coalesce(nullif(btrim(coalesce(p_name,'')), ''), name),
    address = coalesce(nullif(btrim(coalesce(p_address,'')), ''), address),
    area    = coalesce(nullif(btrim(coalesce(p_area,'')), ''), area),
    status  = case when status = 'rejected' then 'pending' else status end,
    review_note = case when status = 'rejected' then null else review_note end
  where id = v_comm.id
  returning * into v_comm;
  return v_comm;
end; $$;

-- Instant code change, 30-day cooldown once live. Rotation soft-revokes stored
-- memberships lazily (0021), which is the warned-about consequence.
create or replace function public.change_my_community_code(p_code text)
returns public.communities
language plpgsql security definer set search_path = public as $$
declare v_comm public.communities; v_code text;
begin
  select c.* into v_comm from communities c
  join community_owners o on o.community_id = c.id
  where o.user_id = auth.uid();
  if v_comm.id is null then raise exception 'You do not manage a community.'; end if;

  if v_comm.status = 'active' and v_comm.code_changed_at is not null
     and v_comm.code_changed_at > now() - interval '30 days' then
    raise exception 'You can only change your code once every 30 days.';
  end if;

  v_code := public._validate_community_code(p_code);
  if lower(v_code) = lower(v_comm.code) then return v_comm; end if;
  if not public.is_code_available(v_code) then
    raise exception 'That code is already taken. Try another.';
  end if;

  update communities set code = v_code, code_changed_at = now()
  where id = v_comm.id
  returning * into v_comm;
  return v_comm;
end; $$;

-- ── 5. Owner stats ──
create or replace function public.get_my_community_stats()
returns table (
  members_active int, members_new_30d int,
  searches_30d int, unmet_30d int, wants_waiting int,
  trips_open int, trips_completed int, km_shared double precision
)
language plpgsql security definer set search_path = public stable as $$
declare v_comm uuid;
begin
  select community_id into v_comm from community_owners where user_id = auth.uid();
  if v_comm is null then raise exception 'You do not manage a community.'; end if;

  return query select
    (select count(*)::int from community_members where community_id = v_comm and status = 'active'),
    (select count(*)::int from community_members where community_id = v_comm and joined_at > now() - interval '30 days'),
    (select count(*)::int from ride_wants where community_id = v_comm and created_at > now() - interval '30 days'),
    (select count(*)::int from ride_wants where community_id = v_comm and created_at > now() - interval '30 days' and results_count = 0),
    (select count(*)::int from ride_wants where community_id = v_comm and status = 'open' and wants_notify),
    (select count(*)::int from trips where community_id = v_comm and status = 'open'),
    (select count(*)::int from trips where community_id = v_comm and status = 'completed'),
    (select coalesce(sum(distance_km), 0)::double precision from trips where community_id = v_comm and status = 'completed');
end; $$;

-- Top areas members come from, aggregate only, minimum 3 distinct people per
-- area so no individual can be singled out.
create or replace function public.get_my_community_top_areas()
returns table (area text, member_count int)
language plpgsql security definer set search_path = public stable as $$
declare v_comm uuid;
begin
  select community_id into v_comm from community_owners where user_id = auth.uid();
  if v_comm is null then raise exception 'You do not manage a community.'; end if;

  return query
    select src.locality, count(distinct src.uid)::int
    from (
      select t.locality, t.host_id as uid from trips t
        where t.community_id = v_comm and t.locality is not null
      union all
      select w.locality, w.user_id from ride_wants w
        where w.community_id = v_comm and w.locality is not null
    ) src
    group by src.locality
    having count(distinct src.uid) >= 3
    order by count(distinct src.uid) desc
    limit 4;
end; $$;

-- ── 6. Grants ──
revoke execute on function public._validate_community_code(text) from anon, public, authenticated;
revoke execute on function public.is_code_available(text) from anon, public;
revoke execute on function public.create_my_community(text, text, text, text, text) from anon, public;
revoke execute on function public.get_my_owned_community() from anon, public;
revoke execute on function public.update_my_community(text, text, text) from anon, public;
revoke execute on function public.change_my_community_code(text) from anon, public;
revoke execute on function public.get_my_community_stats() from anon, public;
revoke execute on function public.get_my_community_top_areas() from anon, public;

grant execute on function public.is_code_available(text) to authenticated;
grant execute on function public.create_my_community(text, text, text, text, text) to authenticated;
grant execute on function public.get_my_owned_community() to authenticated;
grant execute on function public.update_my_community(text, text, text) to authenticated;
grant execute on function public.change_my_community_code(text) to authenticated;
grant execute on function public.get_my_community_stats() to authenticated;
grant execute on function public.get_my_community_top_areas() to authenticated;
