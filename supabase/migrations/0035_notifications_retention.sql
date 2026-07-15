-- ============================================================
-- Veesaa — notifications retention. Keeps the notifications table bounded by
-- pruning stale rows on a schedule, so it never grows unbounded.
--   - read notifications older than 90 days are removed
--   - any notification (read or not) older than 12 months is removed
-- Paste into Supabase Studio -> SQL Editor and run. To run the daily cleanup,
-- enable pg_cron (Database -> Extensions -> pg_cron); the scheduling block below
-- registers the job automatically once the extension is present.
-- ============================================================

create or replace function public.prune_notifications()
returns integer
language sql security definer set search_path = public as $$
  with deleted as (
    delete from public.notifications
    where (read = true and created_at < now() - interval '90 days')
       or (created_at < now() - interval '12 months')
    returning 1
  )
  select count(*)::int from deleted;
$$;

-- Internal maintenance only: never callable by clients.
revoke all on function public.prune_notifications() from public;
revoke all on function public.prune_notifications() from anon;
revoke all on function public.prune_notifications() from authenticated;

-- Schedule a daily run at 03:15 UTC when pg_cron is available.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    if exists (select 1 from cron.job where jobname = 'veesaa-prune-notifications') then
      perform cron.unschedule('veesaa-prune-notifications');
    end if;
    perform cron.schedule(
      'veesaa-prune-notifications',
      '15 3 * * *',
      $cron$ select public.prune_notifications(); $cron$
    );
  end if;
end $$;
