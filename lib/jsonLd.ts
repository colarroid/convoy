import { SITE_URL, SITE_NAME, LEGAL_NAME, SITE_DESCRIPTION, SUPPORT_EMAIL, COUNTRIES, SAME_AS } from './seo'

/**
 * Schema.org graph describing what Veesaa is, who runs it, where it operates and
 * what it costs. Search engines use it for rich results; AI assistants use it to
 * understand the product well enough to recommend it accurately.
 */
export function siteGraph() {
  const org = {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: LEGAL_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/icons/icon-512.png`, width: 512, height: 512 },
    image: `${SITE_URL}/og.png`,
    description: SITE_DESCRIPTION,
    email: SUPPORT_EMAIL,
    // Ties the brand's official profiles to this domain as one entity.
    sameAs: SAME_AS,
    areaServed: COUNTRIES.map((name) => ({ '@type': 'Country', name })),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: SUPPORT_EMAIL,
      areaServed: COUNTRIES as unknown as string[],
      availableLanguage: ['en'],
    },
  }

  const website = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en',
  }

  // The product itself: a free, installable web app for community carpooling.
  const app = {
    '@type': 'WebApplication',
    '@id': `${SITE_URL}/#webapp`,
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: 'TravelApplication',
    operatingSystem: 'Any (progressive web app)',
    browserRequirements: 'Requires a modern web browser',
    description: SITE_DESCRIPTION,
    publisher: { '@id': `${SITE_URL}/#organization` },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free to use. Veesaa takes no fare and no cut of any ride.',
    },
    featureList: [
      'Join a private community with a community code',
      'The community code doubles as the shared destination, so no address to type',
      'Offer a ride and approve neighbours who request a seat',
      'Find a ride from someone in your community heading the same way',
      'Agree a pickup point and travel together for free',
    ],
    audience: {
      '@type': 'Audience',
      audienceType: 'Members of a closed community such as a workplace, campus, estate, club or place of worship',
    },
  }

  // The service in plain terms, for engines that prefer Service over WebApplication.
  const service = {
    '@type': 'Service',
    '@id': `${SITE_URL}/#service`,
    name: 'Community lift-sharing',
    serviceType: 'Carpooling and lift-sharing coordination',
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: COUNTRIES.map((name) => ({ '@type': 'Country', name })),
    description:
      'Veesaa coordinates free shared rides inside closed communities. Members enter a community code, which both grants access to that community and identifies the shared destination. Hosts post a departure time and pickup point; riders request a seat and the host approves.',
    isRelatedTo: ['Carpooling', 'Ridesharing', 'Commuting', 'Sustainable transport'],
  }

  return { '@context': 'https://schema.org', '@graph': [org, website, app, service] }
}

/** FAQPage schema built from the help-centre questions. */
export function faqGraph(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/help#faq`,
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}

/** HowTo schema for the step-by-step on /how-it-works. */
export function howToGraph(steps: { name: string; text: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${SITE_URL}/how-it-works#howto`,
    name: 'How to share a ride with your community on Veesaa',
    description:
      'Enter your community code, offer or find a ride, match with neighbours from that community, and travel together for free.',
    totalTime: 'PT2M',
    estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0' },
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${SITE_URL}/how-it-works#step-${i + 1}`,
    })),
  }
}
