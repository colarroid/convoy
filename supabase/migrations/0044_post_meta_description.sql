-- Optional per-post meta description.
--
-- The excerpt does double duty: preview text on cards and the search snippet.
-- Those pull in different directions, so this lets a post override the snippet
-- without forcing a second blurb on every post. Empty means "fall back to the
-- excerpt", which is what the article page does.

alter table public.posts
  add column if not exists meta_description text;

-- Return it alongside the rest of the article. Postgres will not let a function
-- change its return type in place, so the old one is dropped first.
drop function if exists public.get_post_by_slug(text);

create or replace function public.get_post_by_slug(p_slug text)
returns table (
  slug text, title text, excerpt text, meta_description text, body_md text,
  cover_url text, category text, author_name text,
  published_at timestamptz, updated_at timestamptz
)
language sql security definer set search_path = public stable as $$
  select slug, title, excerpt, meta_description, body_md, cover_url, category,
         author_name, published_at, updated_at
  from public.posts
  where status = 'published' and published_at is not null and published_at <= now()
    and slug = btrim(lower(p_slug))
  limit 1;
$$;

revoke execute on function public.get_post_by_slug(text) from public;
grant execute on function public.get_post_by_slug(text) to anon, authenticated;
