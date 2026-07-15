-- ============================================================
-- Veesaa — per-user rate limiting for reports and ride-join requests, enforced
-- with BEFORE INSERT triggers so they hold on every path (RLS insert or RPC).
-- Limits are deliberately generous: they stop spam/abuse, not normal use.
-- Paste into Supabase Studio -> SQL Editor and run.
-- ============================================================

-- ── Reports: at most 5 per hour and 20 per day per reporter ──
create or replace function public.enforce_report_rate_limit()
returns trigger
language plpgsql security definer set search_path = public as $$
declare recent int;
begin
  select count(*) into recent from public.reports
    where reporter_id = new.reporter_id and created_at > now() - interval '1 hour';
  if recent >= 5 then
    raise exception 'You are filing reports too quickly. Please try again later.'
      using errcode = 'check_violation';
  end if;

  select count(*) into recent from public.reports
    where reporter_id = new.reporter_id and created_at > now() - interval '24 hours';
  if recent >= 20 then
    raise exception 'Daily report limit reached. Please try again tomorrow.'
      using errcode = 'check_violation';
  end if;

  return new;
end $$;

drop trigger if exists reports_rate_limit on public.reports;
create trigger reports_rate_limit
  before insert on public.reports
  for each row execute function public.enforce_report_rate_limit();

-- ── Join requests: at most 20 per hour per rider ──
create or replace function public.enforce_join_request_rate_limit()
returns trigger
language plpgsql security definer set search_path = public as $$
declare recent int;
begin
  select count(*) into recent from public.join_requests
    where rider_id = new.rider_id and created_at > now() - interval '1 hour';
  if recent >= 20 then
    raise exception 'You are sending ride requests too quickly. Please try again later.'
      using errcode = 'check_violation';
  end if;

  return new;
end $$;

drop trigger if exists join_requests_rate_limit on public.join_requests;
create trigger join_requests_rate_limit
  before insert on public.join_requests
  for each row execute function public.enforce_join_request_rate_limit();
