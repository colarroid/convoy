-- ============================================================
-- Convoy — initial schema, RLS, and code-gated functions
-- Paste into Supabase Studio → SQL Editor and run.
-- Model: communities are created by a separate admin dashboard;
-- this app only reads them via a code. No persistent membership —
-- the code gates access each time. No user types (host/rider is
-- per-trip). Rides are free.
-- ============================================================

-- ---------- Tables ----------

-- 1. profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  first_name      text not null default '',
  last_name       text not null default '',
  phone           text,
  photo_url       text,
  rides_completed int  not null default 0,
  created_at      timestamptz not null default now()
);

-- 2. communities (managed by the admin dashboard; read-only here)
create table if not exists public.communities (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  name         text not null,
  address      text,
  area         text,
  banner_color text default '#111111',
  created_at   timestamptz not null default now()
);

-- 3. trips (a posted offer)
create table if not exists public.trips (
  id              uuid primary key default gen_random_uuid(),
  host_id         uuid not null references public.profiles (id) on delete cascade,
  community_id    uuid not null references public.communities (id) on delete cascade,
  depart_date     date not null,
  depart_time     text not null,
  pickup_point    text not null,
  pickup_note     text,
  vehicle         text,
  color           text,
  color_hex       text,
  plate_number    text,
  unknown_vehicle boolean not null default false,
  seats_total     int not null default 1,
  seats_open      int not null default 1,
  status          text not null default 'open'
                  check (status in ('open', 'full', 'completed', 'cancelled')),
  created_at      timestamptz not null default now()
);
create index if not exists trips_community_idx on public.trips (community_id);
create index if not exists trips_host_idx on public.trips (host_id);

-- 4. join_requests (rider asks to join a trip)
create table if not exists public.join_requests (
  id         uuid primary key default gen_random_uuid(),
  trip_id    uuid not null references public.trips (id) on delete cascade,
  rider_id   uuid not null references public.profiles (id) on delete cascade,
  status     text not null default 'pending'
             check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  unique (trip_id, rider_id)
);
create index if not exists join_requests_trip_idx on public.join_requests (trip_id);
create index if not exists join_requests_rider_idx on public.join_requests (rider_id);

-- 5. user_settings (notification toggles)
create table if not exists public.user_settings (
  user_id            uuid primary key references public.profiles (id) on delete cascade,
  push_notifications boolean not null default true,
  email_updates      boolean not null default true,
  ride_reminders     boolean not null default true
);

-- ---------- New-user trigger: auto-create profile + settings ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Helper functions (avoid cross-table RLS recursion) ----------
-- These run as the function owner (security definer) so the table they query
-- does NOT re-apply its own RLS — which is what prevents trips<->join_requests
-- policies from recursing into each other.
create or replace function public.user_hosts_trip(p_trip uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.trips where id = p_trip and host_id = auth.uid());
$$;

create or replace function public.user_has_request_on_trip(p_trip uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.join_requests where trip_id = p_trip and rider_id = auth.uid());
$$;

grant execute on function public.user_hosts_trip(uuid)          to authenticated;
grant execute on function public.user_has_request_on_trip(uuid) to authenticated;

-- ---------- Row-Level Security ----------
alter table public.profiles       enable row level security;
alter table public.communities    enable row level security;
alter table public.trips          enable row level security;
alter table public.join_requests  enable row level security;
alter table public.user_settings  enable row level security;

-- profiles: a user reads/updates only their own row
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- user_settings: own only
create policy "settings_all_own" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- communities: NO direct table access. Reads go through the
-- security-definer functions below (the code is the gate).

-- trips: a user sees a trip if they host it OR have a request on it.
-- Browsing a community's open trips is done via get_community_trips().
create policy "trips_select_host_or_requester" on public.trips
  for select using (
    host_id = auth.uid()
    or public.user_has_request_on_trip(id)
  );
create policy "trips_insert_own" on public.trips
  for insert with check (host_id = auth.uid());
create policy "trips_update_own" on public.trips
  for update using (host_id = auth.uid());
create policy "trips_delete_own" on public.trips
  for delete using (host_id = auth.uid());

-- join_requests: rider manages own; host sees/updates requests on their trips
create policy "requests_insert_own" on public.join_requests
  for insert with check (rider_id = auth.uid());
create policy "requests_select_rider_or_host" on public.join_requests
  for select using (
    rider_id = auth.uid()
    or public.user_hosts_trip(trip_id)
  );
create policy "requests_update_host" on public.join_requests
  for update using (public.user_hosts_trip(trip_id));
create policy "requests_delete_own" on public.join_requests
  for delete using (rider_id = auth.uid());

-- ---------- Code-gated functions ----------

-- Validate a code and return the community (for the "enter code" screen).
create or replace function public.get_community_by_code(p_code text)
returns public.communities
language sql
security definer set search_path = public
stable
as $$
  select * from public.communities
  where lower(code) = lower(trim(p_code))
  limit 1;
$$;

-- Return open trips for a community, gated by the code. Direct table reads
-- are blocked by RLS, so this is the only way to browse another host's rides.
create or replace function public.get_community_trips(p_code text)
returns setof public.trips
language sql
security definer set search_path = public
stable
as $$
  select t.*
  from public.trips t
  join public.communities c on c.id = t.community_id
  where lower(c.code) = lower(trim(p_code))
    and t.status = 'open'
  order by t.depart_date, t.depart_time;
$$;

grant execute on function public.get_community_by_code(text) to authenticated;
grant execute on function public.get_community_trips(text)   to authenticated;

-- ---------- Seed: the test community (admin dashboard does this later) ----------
insert into public.communities (code, name, address, area, banner_color)
values (
  'THNC-SABO',
  'The Hope Nation Church',
  'Tripple C Event Centre, 8/9 Commercial Ave, Sabo, Yaba, Lagos.',
  'Yaba, Lagos.',
  '#111111'
)
on conflict (code) do nothing;
