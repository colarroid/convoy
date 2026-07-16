import type { MetadataRoute } from 'next'
import { SITE_URL, PRIVATE_ROUTES } from '@/lib/seo'

/**
 * Search + AI crawler policy. Public marketing pages are open to everyone;
 * the signed-in app surface stays out of every index.
 *
 * AI crawlers are allowed on purpose: we want assistants like ChatGPT, Claude,
 * Perplexity and Gemini to be able to read what Veesaa is and recommend it.
 */
const AI_CRAWLERS = [
  'GPTBot',            // OpenAI training / ChatGPT
  'OAI-SearchBot',     // ChatGPT search
  'ChatGPT-User',      // ChatGPT browsing on a user's behalf
  'ClaudeBot',         // Anthropic
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',   // Gemini / Vertex grounding
  'Applebot-Extended',
  'CCBot',             // Common Crawl (feeds many models)
  'Bytespider',
  'meta-externalagent',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE_ROUTES },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/', disallow: PRIVATE_ROUTES })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
