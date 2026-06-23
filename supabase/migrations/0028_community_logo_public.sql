-- Include the logo in the public Communities directory.
create or replace function public.list_public_communities()
returns table (name text, area text, country text, logo_url text)
language sql
security definer
set search_path = public
as $$
  select name, area, upper(country), logo_url
  from public.communities
  where country is not null and btrim(country) <> ''
  order by upper(country), name
$$;

revoke execute on function public.list_public_communities() from public;
grant execute on function public.list_public_communities() to anon, authenticated;
