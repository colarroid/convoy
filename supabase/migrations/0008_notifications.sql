-- ============================================================
-- Convoy — in-app notifications (the record behind the push).
-- push_notification() is security-definer so an actor can drop a row in the
-- recipient's inbox (RLS otherwise restricts inserts to your own rows).
-- Paste into Supabase Studio → SQL Editor and run.
-- ============================================================

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  title      text not null,
  body       text,
  url        text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications_select_own" on public.notifications
  for select using (user_id = auth.uid());
create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid());

-- Insert a notification into someone's inbox (used by the API route after a
-- request / approval / cancellation etc.).
create or replace function public.push_notification(
  p_user uuid, p_title text, p_body text default null, p_url text default null
)
returns void
language sql security definer set search_path = public as $$
  insert into public.notifications (user_id, title, body, url)
  values (p_user, p_title, p_body, p_url);
$$;
grant execute on function public.push_notification(uuid, text, text, text) to authenticated;
