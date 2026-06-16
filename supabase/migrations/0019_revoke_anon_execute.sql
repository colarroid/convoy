-- ============================================================
-- Convoy — follow-up to 0018. Supabase's default privileges grant EXECUTE on
-- public functions DIRECTLY to the `anon` role (not only via PUBLIC), so
-- revoking from PUBLIC alone leaves anon able to call them. Here we revoke
-- EXECUTE from `anon` explicitly, keeping `authenticated`. This clears the
-- "callable without signing in" Security Advisor warnings.
-- Paste into Supabase Studio → SQL Editor and run, then Refresh the Advisor.
-- ============================================================

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
    'public.current_user_suspended()',
    'public.push_notification(uuid, text, text, text)'
  ];
begin
  foreach fn in array fns loop
    begin
      execute format('revoke execute on function %s from anon, public', fn);
    exception when undefined_function then
      raise notice 'skipping % (not found with this signature)', fn;
    end;
  end loop;
end $$;
