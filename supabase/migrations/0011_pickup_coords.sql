-- ============================================================
-- Convoy — store the pickup point's coordinates on each ride (captured from
-- Google Places). Enables future "passing your route" proximity matching.
-- Paste into Supabase Studio → SQL Editor and run.
-- ============================================================

alter table public.trips add column if not exists pickup_lat double precision;
alter table public.trips add column if not exists pickup_lng double precision;
