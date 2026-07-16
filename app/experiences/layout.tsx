import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Experiences',
  description:
    'Real stories from Veesaa members: neighbours who stopped driving alone and started getting there together.',
  alternates: { canonical: '/experiences' },
  openGraph: {
    title: 'Member experiences on Veesaa',
    description: 'Real stories from neighbours getting there together.',
    url: '/experiences',
    type: 'website',
  },
}

export default function ExperiencesLayout({ children }: { children: React.ReactNode }) {
  return children
}
