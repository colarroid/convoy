import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help centre',
  description:
    'Answers about offering a ride, finding a ride, community codes, your account, costs and safety on Veesaa. Still stuck? Contact us at hello@veesaa.co.',
  alternates: { canonical: '/help' },
  openGraph: {
    title: 'Veesaa help centre | FAQs and support',
    description: 'Answers about offering and finding rides, community codes, costs, safety and your account.',
    url: '/help',
    type: 'website',
  },
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children
}
