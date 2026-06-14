-- ============================================================
-- Convoy — CLEAN SLATE (one-off, destructive).
-- Wipes all communities, trips, join requests, notifications and reports.
-- KEEPS user accounts (auth.users + profiles) and resets their ride counts.
-- Paste into Supabase Studio → SQL Editor and run. This CANNOT be undone.
-- ============================================================

-- Truncating communities cascades to trips, then to join_requests, etc.
-- We list the content tables explicitly so the intent is obvious.
truncate table
  public.join_requests,
  public.trips,
  public.communities,
  public.notifications,
  public.reports
restart identity cascade;

-- Reset the per-user completed-ride counter so profiles read "No rides yet".
update public.profiles set rides_completed = 0;
