-- ============================================================
-- Veesaa — CLEAN SLATE (one-off, destructive). CANNOT be undone.
--
-- Wipes EVERYTHING: all member content, all communities, and every account
-- including admins. Use before onboarding real users.
--
-- ⚠️  This deletes your own admin login. You will not be able to sign in to
--     administrator.veesaa.co until you create a new admin. There is no signup
--     page on the admin app, so follow step 4 at the bottom to get back in.
--
-- Deleting from auth.users cascades to profiles, profiles cascades to
-- user_settings, and auth.users also cascades to admins, so those empty
-- themselves.
--
-- Run in Supabase Studio → SQL Editor.
-- ============================================================

begin;

-- 1. All content. Listed explicitly so the intent is obvious; CASCADE is only a
--    safety net for anything referencing these.
truncate table
  public.return_nudges,
  public.trip_feedback,
  public.join_requests,
  public.ride_wants,
  public.trips,
  public.community_members,
  public.community_owners,
  public.communities,
  public.notifications,
  public.reports,
  public.experiences,
  public.broadcasts,
  public.call_requests,
  public.waitlist,
  public.posts
restart identity cascade;

-- 2. Every account, admins included. Cascades to profiles, user_settings, admins.
delete from auth.users;

commit;

-- 3. Confirm everything is empty.
select 'auth.users'      as table, count(*) from auth.users
union all select 'profiles',      count(*) from public.profiles
union all select 'admins',        count(*) from public.admins
union all select 'communities',   count(*) from public.communities
union all select 'trips',         count(*) from public.trips
union all select 'notifications', count(*) from public.notifications
union all select 'posts',         count(*) from public.posts
union all select 'waitlist',      count(*) from public.waitlist;

-- ============================================================
-- 4. CREATE YOUR NEW ADMIN (required, or you cannot sign in)
--
--    a. Supabase Dashboard → Authentication → Users → "Add user"
--       Enter the email and password, and tick "Auto Confirm User".
--
--    b. Run this, with that same email:
--
--       insert into public.admins (id)
--       select id from auth.users where email = 'you@veesaa.co'
--       on conflict (id) do nothing;
--
--    c. Sign in at administrator.veesaa.co with those credentials.
-- ============================================================
