-- ============================================================
-- Convoy — tighten EXECUTE grants on SECURITY DEFINER functions.
-- By default Postgres grants EXECUTE to PUBLIC (which includes the logged-out
-- `anon` role). Most of our functions are self-protecting via auth.uid(), but
-- get_community_by_code / get_community_trips would otherwise let anyone with a
-- community code read community + ride data without an account. We revoke the
-- blanket PUBLIC grant and re-grant only to `authenticated`.
--
-- NOTE: we intentionally do NOT touch the RLS helper functions
-- (user_hosts_trip, user_has_request_on_trip) — RLS policy evaluation needs
-- them broadly executable. Paste into Supabase Studio → SQL Editor and run.
-- ============================================================

-- User-facing RPCs: authenticated-only.
do $$
declare
  fn text;
  fns text[] := array[
    'public.get_community_by_code(text)',
    'public.get_community_trips(text, double precision, double precision, double precision)',
    'public.get_my_trips()',
    'public.get_trip_detail(uuid)',
    'public.get_my_joined_trips()',
    'public.get_trip_requests(uuid, text)',
    'public.request_to_join(text, uuid)',
    'public.resolve_request(uuid, text)',
    'public.cancel_trip(uuid)',
    'public.withdraw_request(uuid)',
    'public.complete_trip(uuid)',
    'public.get_ride_history()',
    'public.is_admin()',
    'public.current_user_suspended()'
  ];
begin
  foreach fn in array fns loop
    begin
      execute format('revoke execute on function %s from public', fn);
      execute format('grant execute on function %s to authenticated', fn);
    exception when undefined_function then
      raise notice 'skipping % (not found with this signature)', fn;
    end;
  end loop;
end $$;

-- Orphaned helper: no longer called by the app (server-side _notify is used
-- instead). Remove all direct execute access so it can't be abused to drop
-- notifications into arbitrary inboxes.
revoke execute on function public.push_notification(uuid, text, text, text) from public;
