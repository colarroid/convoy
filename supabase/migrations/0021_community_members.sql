-- ============================================================
-- Convoy — community_members: a REMEMBERED-ACCESS CACHE, *not* the access gate.
--
-- The community CODE remains the security gate: every access RPC still validates
-- a code (get_community_by_code / get_community_trips). This table only records
-- which codes a user has entered so a returning user can pick a held community
-- instead of retyping. It stores the entered `code` on purpose — that is what we
-- re-validate on use, which preserves revoke-by-rotation: rotate or retire a
-- community's code and the stored copies stop resolving, so they get
-- SOFT-revoked (status='revoked', row kept) and drop out of the picker.
--
-- joined_at is the non-backfillable activation-funnel spine and is never
-- overwritten on re-join. Do NOT turn this into the access source of truth.
-- Paste into Supabase Studio → SQL Editor and run.
-- ============================================================

create table if not exists public.community_members (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  community_id uuid not null references public.communities (id) on delete cascade,
  code         text not null,                               -- the gate, re-validated on use
  status       text not null default 'active' check (status in ('active', 'revoked')),
  joined_at    timestamptz not null default now(),          -- funnel spine; never overwritten
  last_used_at timestamptz not null default now(),
  revoked_at   timestamptz,
  unique (user_id, community_id)
);
create index if not exists community_members_user_idx on public.community_members (user_id, last_used_at desc);

alter table public.community_members enable row level security;
-- Reads are own-only; all writes go through the security-definer RPCs below.
create policy "members_select_own" on public.community_members
  for select using (user_id = auth.uid());

-- Validate a code, record/refresh membership for the caller, return the community.
create or replace function public.join_community_by_code(p_code text)
returns public.communities
language plpgsql security definer set search_path = public as $$
declare v_comm public.communities;
begin
  select * into v_comm from public.communities
  where lower(code) = lower(trim(p_code)) limit 1;
  if v_comm.id is null then
    raise exception 'That community code could not be found.';
  end if;

  insert into public.community_members (user_id, community_id, code, status, last_used_at, revoked_at)
  values (auth.uid(), v_comm.id, v_comm.code, 'active', now(), null)
  on conflict (user_id, community_id) do update
    set code = excluded.code,           -- refresh stored code (e.g. after a re-join)
        status = 'active',
        last_used_at = now(),
        revoked_at = null;              -- joined_at intentionally untouched

  return v_comm;
end; $$;

-- The caller's held communities, re-validated against the live code gate.
create or replace function public.get_my_communities()
returns table (
  community_id uuid, code text, name text, area text, logo_url text,
  joined_at timestamptz, last_used_at timestamptz
)
language plpgsql security definer set search_path = public as $$
begin
  -- Soft-revoke memberships whose stored code no longer resolves (rotated/retired).
  update public.community_members cm
    set status = 'revoked', revoked_at = now()
  where cm.user_id = auth.uid()
    and cm.status = 'active'
    and not exists (select 1 from public.communities c where lower(c.code) = lower(cm.code));

  return query
    select c.id, c.code, c.name, c.area, c.logo_url, cm.joined_at, cm.last_used_at
    from public.community_members cm
    join public.communities c on lower(c.code) = lower(cm.code)
    where cm.user_id = auth.uid() and cm.status = 'active'
    order by cm.last_used_at desc;
end; $$;

-- Leave = soft-revoke (row kept so the join cohort/funnel data survives).
create or replace function public.leave_community(p_community uuid)
returns void
language sql security definer set search_path = public as $$
  update public.community_members
    set status = 'revoked', revoked_at = now()
  where user_id = auth.uid() and community_id = p_community and status = 'active';
$$;

-- Authenticated-only (consistent with the 0018/0019 grant hardening).
revoke execute on function public.join_community_by_code(text) from anon, public;
revoke execute on function public.get_my_communities() from anon, public;
revoke execute on function public.leave_community(uuid) from anon, public;
grant execute on function public.join_community_by_code(text) to authenticated;
grant execute on function public.get_my_communities() to authenticated;
grant execute on function public.leave_community(uuid) to authenticated;
