-- ============================================================
-- Veesaa — capture why a trip "didn't happen". When a host marks a past trip
-- as not having happened, we record their optional note so we can learn why
-- trips fall through. Paste into Supabase Studio → SQL Editor and run.
-- ============================================================

create table if not exists public.trip_feedback (
  id         uuid primary key default gen_random_uuid(),
  trip_id    uuid references public.trips (id) on delete set null,
  host_id    uuid not null references public.profiles (id) on delete cascade,
  reason     text,
  created_at timestamptz not null default now()
);
create index if not exists trip_feedback_created_idx on public.trip_feedback (created_at desc);

alter table public.trip_feedback enable row level security;
-- Host can read their own; admin reads everything via the service role.
create policy "trip_feedback_select_own" on public.trip_feedback
  for select using (host_id = auth.uid());

-- Record feedback for a trip the caller hosts (writes go through this RPC, not
-- a direct insert policy, so we can verify ownership server-side).
create or replace function public.record_trip_feedback(p_trip uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.trips where id = p_trip and host_id = auth.uid()) then
    raise exception 'Not authorised';
  end if;
  insert into public.trip_feedback (trip_id, host_id, reason)
  values (p_trip, auth.uid(), nullif(trim(p_reason), ''));
end; $$;

revoke execute on function public.record_trip_feedback(uuid, text) from anon, public;
grant execute on function public.record_trip_feedback(uuid, text) to authenticated;
