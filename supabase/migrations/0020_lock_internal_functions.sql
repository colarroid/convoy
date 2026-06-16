-- ============================================================
-- Convoy — lock down internal functions that are never called over the API.
-- handle_new_user (auth trigger) and rls_auto_enable (event trigger) fire as
-- their owner regardless of grants, and push_notification is an orphaned helper
-- (the app uses the internal _notify instead). Removing all direct EXECUTE
-- clears their Security Advisor warnings without affecting behaviour.
-- Paste into Supabase Studio → SQL Editor and run, then Refresh the Advisor.
-- ============================================================

revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
revoke execute on function public.push_notification(uuid, text, text, text) from anon, authenticated, public;
