-- ============================================================
-- Convoy — safety reports. Members can flag a person, a trip, or a general
-- concern. Admins review the table from the (future) admin dashboard.
-- Paste into Supabase Studio → SQL Editor and run.
-- ============================================================

create table if not exists public.reports (
  id               uuid primary key default gen_random_uuid(),
  reporter_id      uuid not null references public.profiles (id) on delete cascade,
  reported_user_id uuid references public.profiles (id) on delete set null,
  trip_id          uuid references public.trips (id) on delete set null,
  category         text not null,
  details          text,
  status           text not null default 'open'
                   check (status in ('open', 'reviewing', 'resolved')),
  created_at       timestamptz not null default now()
);
create index if not exists reports_status_idx on public.reports (status, created_at desc);

alter table public.reports enable row level security;

-- A member can file a report and see the ones they filed. Review is admin-only
-- (service role / admin dashboard), so no broad select policy here.
create policy "reports_insert_own" on public.reports
  for insert with check (reporter_id = auth.uid());
create policy "reports_select_own" on public.reports
  for select using (reporter_id = auth.uid());
