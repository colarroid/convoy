-- Capture how far each trip covers (pickup -> community destination) so the
-- landing page can show real, growing "miles shared" across completed rides.

-- 1. Per-trip distance in kilometres, filled in by the app at creation time.
alter table public.trips
  add column if not exists distance_km double precision;

-- 2. Public stat: total miles across completed trips.
--    Security definer so logged-out visitors (anon) can read the aggregate
--    without exposing any individual trip rows. Returns whole miles.
create or replace function public.total_miles_shared()
returns bigint
language sql
security definer
set search_path = public
as $$
  select coalesce(
    round(sum(distance_km) filter (where status = 'completed') * 0.621371)::bigint,
    0
  )
  from public.trips
$$;

revoke execute on function public.total_miles_shared() from public;
grant execute on function public.total_miles_shared() to anon, authenticated;
