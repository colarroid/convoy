import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'News and updates',
  description:
    'News and updates from Veesaa: product changes, community stories, and what free community lift-sharing looks like in practice.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'News and updates | Veesaa',
    description: 'Product changes, community stories, and what free community lift-sharing looks like in practice.',
    url: '/blog',
    type: 'website',
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
