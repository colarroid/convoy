-- ============================================================
-- Veesaa: ride_wants, the demand signal.
--
-- Every time a rider searches a community for a ride we record it, along with
-- how many results they saw. Searches that returned nothing are unmet demand:
-- the single most valuable, and completely NON-BACKFILLABLE, signal we have.
-- If we do not record it at the moment it happens, it is gone forever.
--
-- It also makes the "Notify me" promise real: wants_notify riders are notified
-- when a matching ride is later posted in that community.
--
-- Paste into Supabase Studio -> SQL Editor and run.
-- ============================================================

create extension if not exists cube;
create extension if not exists earthdistance;

create table if not exists public.ride_wants (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  community_id   uuid not null references public.communities (id) on delete cascade,
  code           text not null,                 -- the code as entered, for auditing
  starting_place text,                          -- what the rider typed / picked
  start_lat      double precision,
  start_lng      double precision,
  results_count  int  not null default 0,       -- 0 = unmet demand
  wants_notify   boolean not null default false,-- tapped "Notify me"
  status         text not null default 'open'
                 check (status in ('open', 'fulfilled', 'expired')),
  notified_at    timestamptz,
  created_at     timestamptz not null default now()
);

create index if not exists ride_wants_community_idx on public.ride_wants (community_id, created_at desc);
create index if not exists ride_wants_user_idx      on public.ride_wants (user_id, created_at desc);
-- Partial index: the notifier only ever scans open, opted-in wants.
create index if not exists ride_wants_open_notify_idx
  on public.ride_wants (community_id) where status = 'open' and wants_notify;

alter table public.ride_wants enable row level security;
-- Riders can see their own; admins read via the service role. All writes go
-- through the security-definer RPCs below.
create policy "ride_wants_select_own" on public.ride_wants
  for select using (user_id = auth.uid());

-- ── Record a search. Returns the row id so the client can flag notify later. ──
create or replace function public.record_ride_want(
  p_code text,
  p_place text,
  p_lat double precision,
  p_lng double precision,
  p_results int
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_comm uuid; v_id uuid; v_recent int;
begin
  select id into v_comm from public.communities
   where lower(code) = lower(trim(p_code)) limit 1;
  if v_comm is null then
    raise exception 'That community code could not be found.';
  end if;

  -- Light throttle: a rider re-running the same search should not flood the
  -- signal. Reuse the last want for this community if it is under 10 minutes old.
  select id into v_id from public.ride_wants
   where user_id = auth.uid() and community_id = v_comm
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

  -- Hard cap so this can never be used to spam rows.
  select count(*) into v_recent from public.ride_wants
   where user_id = auth.uid() and created_at > now() - interval '1 hour';
  if v_recent >= 30 then
    raise exception 'Too many searches. Please try again later.'
      using errcode = 'check_violation';
  end if;

  insert into public.ride_wants (user_id, community_id, code, starting_place, start_lat, start_lng, results_count)
  values (auth.uid(), v_comm, trim(p_code), p_place, p_lat, p_lng, p_results)
  returning id into v_id;
  return v_id;
end; $$;

-- ── Opt in to being told when a ride appears. ──
create or replace function public.set_ride_want_notify(p_want uuid, p_on boolean)
returns void
language sql security definer set search_path = public as $$
  update public.ride_wants
     set wants_notify = p_on
   where id = p_want and user_id = auth.uid() and status = 'open';
$$;

-- ── Make the promise real: a new ride notifies riders waiting in that community.
-- Fires after a trip is posted. Matches on community, and on proximity when both
-- the want and the trip have coordinates (25km, generous: better a near-miss
-- notification than a silent one).
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
       and w.status = 'open'
       and w.wants_notify
       and w.user_id <> new.host_id          -- don't notify the host of their own ride
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
      'Someone from ' || coalesce(v_dest, 'your community') || ' is heading your way. Grab a seat.',
      '/find/community'
    );
    update public.ride_wants
       set status = 'fulfilled', notified_at = now()
     where id = r.id;
  end loop;

  return new;
end; $$;

drop trigger if exists trips_notify_ride_wants on public.trips;
create trigger trips_notify_ride_wants
  after insert on public.trips
  for each row execute function public.notify_ride_wants();

-- ── Grants: authenticated callers only; the trigger fn is internal. ──
revoke execute on function public.record_ride_want(text, text, double precision, double precision, int) from anon, public;
revoke execute on function public.set_ride_want_notify(uuid, boolean) from anon, public;
revoke execute on function public.notify_ride_wants() from anon, public, authenticated;
grant execute on function public.record_ride_want(text, text, double precision, double precision, int) to authenticated;
grant execute on function public.set_ride_want_notify(uuid, boolean) to authenticated;
