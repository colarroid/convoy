-- ============================================================
-- Convoy — admin foundations (used by the separate convoy-admin dashboard).
-- The admin app authenticates a Supabase user and confirms they're in `admins`;
-- privileged reads/writes run with the service-role key (bypasses RLS).
-- Paste into Supabase Studio → SQL Editor and run.
-- ============================================================

-- Who is an admin (their auth user id).
create table if not exists public.admins (
  id         uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

-- An admin can confirm their own membership (used by the dashboard's auth gate).
create policy "admins_select_self" on public.admins
  for select using (id = auth.uid());

-- Convenience flag for gating elsewhere later.
create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.admins where id = auth.uid());
$$;
grant execute on function public.is_admin() to authenticated;

-- Moderation: suspend a user.
alter table public.profiles add column if not exists suspended boolean not null default false;

-- Reviewer notes on a report.
alter table public.reports add column if not exists admin_notes text;

-- History of broadcast notifications sent from the admin.
create table if not exists public.broadcasts (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text,
  url        text,
  sent_by    uuid references public.profiles (id) on delete set null,
  recipients int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.broadcasts enable row level security;
-- No public policies: the admin app reads/writes this with the service role.
