-- ============================================================
-- Convoy — targeted broadcasts. A broadcast can go to everyone (community_id
-- null) or to one community's participants (hosts + riders who have offered or
-- requested a ride there). Paste into Supabase Studio → SQL Editor and run.
-- ============================================================

alter table public.broadcasts
  add column if not exists community_id uuid references public.communities (id) on delete set null;
