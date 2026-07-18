-- ============================================================
-- Veesaa: community owners can set their own logo.
-- The image itself is uploaded through the community app's server-signed
-- Cloudinary route (owner-gated); this RPC only records the resulting URL,
-- and only accepts our Cloudinary host so arbitrary URLs can't be planted.
-- Paste into Supabase Studio -> SQL Editor and run.
-- ============================================================

create or replace function public.set_my_community_logo(p_url text)
returns public.communities
language plpgsql security definer set search_path = public as $$
declare v_comm public.communities;
begin
  select c.* into v_comm from communities c
  join community_owners o on o.community_id = c.id
  where o.user_id = auth.uid();
  if v_comm.id is null then raise exception 'You do not manage a community.'; end if;

  if p_url is not null and p_url not like 'https://res.cloudinary.com/%' then
    raise exception 'Invalid logo URL.';
  end if;

  update communities set logo_url = p_url where id = v_comm.id
  returning * into v_comm;
  return v_comm;
end; $$;

revoke execute on function public.set_my_community_logo(text) from anon, public;
grant execute on function public.set_my_community_logo(text) to authenticated;
