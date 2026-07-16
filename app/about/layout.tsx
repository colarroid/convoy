import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Why we are building Veesaa: people living side by side head to the same place and travel there alone. Veesaa turns those separate journeys into shared ones, so getting there also means getting closer.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Veesaa | Bringing communities closer',
    description:
      'Our mission is to bring communities closer, one shared ride at a time. Free lift-sharing built around shared destinations and the people you already trust.',
    url: '/about',
    type: 'website',
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
