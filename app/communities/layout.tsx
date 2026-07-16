import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Communities',
  description:
    'See the communities already sharing rides on Veesaa, and bring Veesaa to yours. Live in Nigeria and Canada, growing one trusted community at a time.',
  alternates: { canonical: '/communities' },
  openGraph: {
    title: 'Communities on Veesaa',
    description: 'The communities already sharing rides, and how to bring Veesaa to yours.',
    url: '/communities',
    type: 'website',
  },
}

export default function CommunitiesLayout({ children }: { children: React.ReactNode }) {
  return children
}
