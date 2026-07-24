import type { MetadataRoute } from 'next'
import { SITE_URL, PUBLIC_ROUTES } from '@/lib/seo'
import { getPostSlugs } from '@/lib/blog'

/** Served at /sitemap.xml and referenced from robots.txt. Submit this in Google Search Console. */
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date()

  const staticRoutes = PUBLIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }))

  // Every published post, so new articles are discoverable without a redeploy.
  // Failing soft matters here: a Supabase hiccup should not empty the sitemap.
  const posts = await getPostSlugs().catch(() => [])
  const postRoutes = posts.map(({ slug, updated_at }) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: new Date(updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...postRoutes]
}
