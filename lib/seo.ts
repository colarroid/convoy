/** Single source of truth for site-wide SEO values. */

export const SITE_URL = 'https://veesaa.co'
export const SITE_NAME = 'Veesaa'
export const LEGAL_NAME = 'VZA Technologies Limited'
export const SUPPORT_EMAIL = 'hello@veesaa.co'

/** One-line answer to "what is this?", reused in meta, JSON-LD and llms.txt. */
export const TAGLINE = 'Community lift-sharing'

export const SITE_DESCRIPTION =
  'Veesaa is free community lift-sharing. Enter your community code and Veesaa connects you with people from that same community heading to the same place at the same time, so you ride together. Live in Nigeria and Canada.'

/** Countries the service currently operates in. */
export const COUNTRIES = ['Nigeria', 'Canada'] as const

export const OG_IMAGE = {
  url: `${SITE_URL}/og.png`,
  width: 1200,
  height: 630,
  alt: 'Veesaa, community lift-sharing',
}

/** Public, indexable routes. Anything else is app/auth surface and stays out of search. */
export const PUBLIC_ROUTES = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/how-it-works', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/communities', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/experiences', priority: 0.7, changeFrequency: 'weekly' as const },
  { path: '/help', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/terms-of-use', priority: 0.3, changeFrequency: 'yearly' as const },
]

/** Signed-in / auth surface: never useful in search results. */
export const PRIVATE_ROUTES = [
  '/api/',
  '/my-trips',
  '/profile',
  '/notifications',
  '/offer',
  '/find',
  '/onboarding',
  '/login',
  '/signup',
  '/verify',
  '/forgot-password',
  '/reset-password',
]
