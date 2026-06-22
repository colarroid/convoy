-- Landing-page waitlist: people asking us to bring Veesaa to their community.
-- Public (logged-out) visitors submit, so writes go through a security-definer
-- RPC. The table itself stays locked down (no anon/auth direct access); the
-- admin dashboard reads it with the service-role key.

create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  community  text,
  email      text not null,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_created_idx on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;
-- No policies: direct selects/inserts are blocked for anon and authenticated.

-- Insert via a guarded RPC. Light validation + de-dupe on (email, community).
create or replace function public.join_waitlist(p_community text, p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_comm  text := nullif(trim(coalesce(p_community, '')), '');
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid email';
  end if;

  if exists (
    select 1 from public.waitlist
    where email = v_email
      and coalesce(community, '') = coalesce(v_comm, '')
  ) then
    return;  -- already on the list, treat as success
  end if;

  insert into public.waitlist (community, email) values (v_comm, v_email);
end;
$$;

revoke execute on function public.join_waitlist(text, text) from public;
grant execute on function public.join_waitlist(text, text) to anon, authenticated;
