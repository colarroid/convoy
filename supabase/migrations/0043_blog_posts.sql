-- Veesaa: blog / news posts.
--
-- Authored in the admin dashboard with the service role, read publicly through
-- RPCs. Follows the same shape as `experiences`: RLS on with no direct policies,
-- so nothing reaches the public except what these functions return, and drafts
-- can never leak.

create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  excerpt      text,
  body_md      text not null default '',
  cover_url    text,
  category     text,
  author_name  text,
  status       text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- The public list only ever reads published rows, newest first.
create index if not exists posts_published_idx
  on public.posts (published_at desc) where status = 'published';
create index if not exists posts_slug_idx on public.posts (slug);

alter table public.posts enable row level security;
-- No direct policies: the public reads via the RPCs below, the admin dashboard
-- reads and writes with the service-role key.

-- ── Public reads ──

-- Card data for the index and the landing section. Deliberately omits body_md,
-- which is only needed on the article page.
create or replace function public.list_posts(p_limit int default 50, p_offset int default 0)
returns table (
  slug text, title text, excerpt text, cover_url text,
  category text, author_name text, published_at timestamptz
)
language sql security definer set search_path = public stable as $$
  select slug, title, excerpt, cover_url, category, author_name, published_at
  from public.posts
  where status = 'published' and published_at is not null and published_at <= now()
  order by published_at desc
  limit greatest(1, least(coalesce(p_limit, 50), 100))
  offset greatest(0, coalesce(p_offset, 0));
$$;

-- One article, published only. Returns no row for a draft or unknown slug, which
-- the page turns into a 404.
create or replace function public.get_post_by_slug(p_slug text)
returns table (
  slug text, title text, excerpt text, body_md text, cover_url text,
  category text, author_name text, published_at timestamptz, updated_at timestamptz
)
language sql security definer set search_path = public stable as $$
  select slug, title, excerpt, body_md, cover_url, category, author_name, published_at, updated_at
  from public.posts
  where status = 'published' and published_at is not null and published_at <= now()
    and slug = btrim(lower(p_slug))
  limit 1;
$$;

-- Slugs + timestamps for the sitemap. Cheap, and keeps the sitemap honest.
create or replace function public.list_post_slugs()
returns table (slug text, updated_at timestamptz)
language sql security definer set search_path = public stable as $$
  select slug, updated_at
  from public.posts
  where status = 'published' and published_at is not null and published_at <= now()
  order by published_at desc;
$$;

-- ── Grants ──
-- Anonymous visitors and crawlers must be able to read the blog, so anon gets
-- execute on the read functions. Writes stay with the service role only.
revoke execute on function public.list_posts(int, int) from public;
revoke execute on function public.get_post_by_slug(text) from public;
revoke execute on function public.list_post_slugs() from public;

grant execute on function public.list_posts(int, int) to anon, authenticated;
grant execute on function public.get_post_by_slug(text) to anon, authenticated;
grant execute on function public.list_post_slugs() to anon, authenticated;
