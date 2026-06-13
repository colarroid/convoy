-- ============================================================
-- Convoy — enable Supabase Realtime on `notifications` so the nav bell updates
-- live (no refresh needed). RLS already restricts the stream to each user's
-- own rows. Paste into Supabase Studio → SQL Editor and run.
-- ============================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
