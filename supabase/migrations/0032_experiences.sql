-- Member experiences (testimonials). Members share one experience from their
-- profile; admins moderate (hide) and pin up to 7 to feature on the landing.
-- Every visible experience also appears on the public /experiences page.

create table if not exists public.experiences (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references public.profiles (id) on delete cascade,
  body       text not null,
  pinned     boolean not null default false,
  visible    boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists experiences_pinned_idx on public.experiences (pinned) where pinned;
create index if not exists experiences_created_idx on public.experiences (created_at desc);

alter table public.experiences enable row level security;
-- No direct policies: members write via RPC, the public reads via RPC, the
-- admin dashboard reads/moderates with the service-role key.

-- Member submits/updates their own experience.
create or replace function public.submit_experience(p_body text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v text := nullif(btrim(p_body), '');
begin
  if auth.uid() is null then raise exception 'auth required'; end if;
  if v is null then raise exception 'empty experience'; end if;
  insert into public.experiences (user_id, body)
  values (auth.uid(), v)
  on conflict (user_id) do update set body = excluded.body, updated_at = now();
end;
$$;
revoke execute on function public.submit_experience(text) from public;
grant execute on function public.submit_experience(text) to authenticated;

-- The caller's own experience (to show/edit on the profile).
create or replace function public.get_my_experience()
returns table (body text, pinned boolean, visible boolean, created_at timestamptz)
language sql security definer set search_path = public stable as $$
  select body, pinned, visible, created_at from public.experiences where user_id = auth.uid();
$$;
grant execute on function public.get_my_experience() to authenticated;

-- Public list of visible experiences (optionally only the pinned ones).
create or replace function public.list_experiences(p_pinned_only boolean default false)
returns table (id uuid, name text, photo_url text, body text, created_at timestamptz)
language sql security definer set search_path = public stable as $$
  select e.id,
         nullif(btrim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')), ''),
         p.photo_url, e.body, e.created_at
  from public.experiences e
  join public.profiles p on p.id = e.user_id
  where e.visible and (not p_pinned_only or e.pinned)
  order by e.pinned desc, e.created_at desc;
$$;
revoke execute on function public.list_experiences(boolean) from public;
grant execute on function public.list_experiences(boolean) to anon, authenticated;
