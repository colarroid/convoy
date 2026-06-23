-- Switch the public "distance shared" stat from miles to kilometres.
-- distance_km is already stored in km, so we just sum it (no conversion).
create or replace function public.total_km_shared()
returns bigint
language sql
security definer
set search_path = public
as $$
  select coalesce(round(sum(distance_km) filter (where status = 'completed'))::bigint, 0)
  from public.trips
$$;

revoke execute on function public.total_km_shared() from public;
grant execute on function public.total_km_shared() to anon, authenticated;

-- The old miles function is no longer used.
drop function if exists public.total_miles_shared();
