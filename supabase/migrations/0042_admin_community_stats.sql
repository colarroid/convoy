-- Admin-facing community stats.
--
-- These mirror the owner-dashboard RPCs (get_my_community_stats /
-- get_my_community_top_areas) exactly, but take a community id instead of
-- resolving it from auth.uid(), so a Veesaa admin can see the same numbers a
-- community manager sees, for any community. Called from the admin app with the
-- service role.

create or replace function public.admin_community_stats(p_community_id uuid)
returns table (
  members_active int, members_new_30d int,
  searches_30d int, unmet_30d int, wants_waiting int,
  trips_open int, trips_completed int, km_shared double precision
)
language plpgsql security definer set search_path = public stable as $$
begin
  return query select
    (select count(*)::int from community_members where community_id = p_community_id and status = 'active'),
    (select count(*)::int from community_members where community_id = p_community_id and joined_at > now() - interval '30 days'),
    (select count(*)::int from ride_wants where community_id = p_community_id and created_at > now() - interval '30 days'),
    (select count(*)::int from ride_wants where community_id = p_community_id and created_at > now() - interval '30 days' and results_count = 0),
    (select count(*)::int from ride_wants where community_id = p_community_id and status = 'open' and wants_notify),
    (select count(*)::int from trips where community_id = p_community_id and status = 'open'),
    (select count(*)::int from trips where community_id = p_community_id and status = 'completed'),
    (select coalesce(sum(distance_km), 0)::double precision from trips where community_id = p_community_id and status = 'completed');
end; $$;

-- Top areas members come from, aggregate only, minimum 3 distinct people per
-- area, matching the owner view so no individual can be singled out.
create or replace function public.admin_community_top_areas(p_community_id uuid)
returns table (area text, member_count int)
language plpgsql security definer set search_path = public stable as $$
begin
  return query
    select src.locality, count(distinct src.uid)::int
    from (
      select t.locality, t.host_id as uid from trips t
        where t.community_id = p_community_id and t.locality is not null
      union all
      select w.locality, w.user_id from ride_wants w
        where w.community_id = p_community_id and w.locality is not null
    ) src
    group by src.locality
    having count(distinct src.uid) >= 3
    order by count(distinct src.uid) desc
    limit 4;
end; $$;

-- Admin-only. Deny app users; the admin app calls these with the service role.
revoke execute on function public.admin_community_stats(uuid) from anon, public, authenticated;
revoke execute on function public.admin_community_top_areas(uuid) from anon, public, authenticated;
grant execute on function public.admin_community_stats(uuid) to service_role;
grant execute on function public.admin_community_top_areas(uuid) to service_role;
