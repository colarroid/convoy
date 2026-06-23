-- Country on communities so the public Communities page can group them.
-- Stored as an ISO-3166 alpha-2 code (e.g. 'NG', 'CA').

alter table public.communities
  add column if not exists country text;

-- Public directory: name, area and country only (never the join code), for
-- communities that have a country set. Security definer so logged-out visitors
-- can read the aggregate without any access to the table itself.
create or replace function public.list_public_communities()
returns table (name text, area text, country text)
language sql
security definer
set search_path = public
as $$
  select name, area, upper(country)
  from public.communities
  where country is not null and btrim(country) <> ''
  order by upper(country), name
$$;

revoke execute on function public.list_public_communities() from public;
grant execute on function public.list_public_communities() to anon, authenticated;
