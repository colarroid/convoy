-- ============================================================
-- Veesaa — notify_self: let an authenticated user drop a notification into
-- THEIR OWN inbox (e.g. a "password changed" security alert). Safe: it always
-- targets auth.uid(), so a user can only ever notify themselves — no spam
-- vector. The insert flows through the usual webhook → push + email pipeline.
-- Paste into Supabase Studio → SQL Editor and run.
-- ============================================================

create or replace function public.notify_self(p_title text, p_body text default null, p_url text default null)
returns void language sql security definer set search_path = public as $$
  insert into public.notifications (user_id, title, body, url)
  values (auth.uid(), p_title, p_body, p_url);
$$;

revoke execute on function public.notify_self(text, text, text) from anon, public;
grant execute on function public.notify_self(text, text, text) to authenticated;
