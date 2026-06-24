-- "Schedule a call" requests from the public Communities page.
-- Public visitors submit, so writes go through a guarded security-definer RPC;
-- the table stays locked down and the admin dashboard reads it via service role.

create table if not exists public.call_requests (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text not null,
  community  text,
  is_admin   boolean not null default false,
  note       text,
  created_at timestamptz not null default now()
);

create index if not exists call_requests_created_idx on public.call_requests (created_at desc);

alter table public.call_requests enable row level security;
-- No policies: anon/authenticated have no direct access.

create or replace function public.request_call(
  p_name text, p_email text, p_community text, p_is_admin boolean, p_note text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid email';
  end if;
  insert into public.call_requests (name, email, community, is_admin, note)
  values (
    nullif(trim(coalesce(p_name, '')), ''),
    v_email,
    nullif(trim(coalesce(p_community, '')), ''),
    coalesce(p_is_admin, false),
    nullif(trim(coalesce(p_note, '')), '')
  );
end;
$$;

revoke execute on function public.request_call(text, text, text, boolean, text) from public;
grant execute on function public.request_call(text, text, text, boolean, text) to anon, authenticated;
