import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'Enter your community code, offer or find a ride, match with neighbours from that community, and travel together for free. Your code gives you access to a community and tells us the destination, so you never type an address.',
  alternates: { canonical: '/how-it-works' },
  openGraph: {
    title: 'How Veesaa works | Community lift-sharing in four steps',
    description:
      'Enter your community code, offer or find a ride, match with your neighbours, and go together for free.',
    url: '/how-it-works',
    type: 'website',
  },
}

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children
}
