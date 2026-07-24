import { supabasePublic as supabase } from './supabasePublic'

/** Card data for the blog index and the landing "News and updates" section. */
export interface PostCard {
  slug: string
  title: string
  excerpt: string | null
  cover_url: string | null
  category: string | null
  author_name: string | null
  published_at: string
}

/** A full article. */
export interface Post extends PostCard {
  body_md: string
  updated_at: string
}

/** Published posts, newest first. */
export async function getPosts(limit = 50, offset = 0): Promise<PostCard[]> {
  const { data, error } = await supabase.rpc('list_posts', { p_limit: limit, p_offset: offset })
  if (error || !data) return []
  return data as PostCard[]
}

/** One published article, or null for a draft or unknown slug. */
export async function getPost(slug: string): Promise<Post | null> {
  const { data, error } = await supabase.rpc('get_post_by_slug', { p_slug: slug })
  if (error || !data || !data[0]) return null
  return data[0] as Post
}

/** Slugs for the sitemap. */
export async function getPostSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const { data, error } = await supabase.rpc('list_post_slugs')
  if (error || !data) return []
  return data as { slug: string; updated_at: string }[]
}

/** "12 Mar 2026" */
export const formatPostDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

/** Rough reading time from the markdown source, at 200 words per minute. */
export const readingMinutes = (md: string) =>
  Math.max(1, Math.round(md.trim().split(/\s+/).length / 200))
