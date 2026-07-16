import type { MetadataRoute } from 'next'
import { SITE_URL, PUBLIC_ROUTES } from '@/lib/seo'

/** Served at /sitemap.xml and referenced from robots.txt. Submit this in Google Search Console. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return PUBLIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }))
}
