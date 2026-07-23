import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Communities',
  description:
    'Veesaa is already bringing communities together by providing a free lift-sharing service to members, making every journey fun. Live in Nigeria and Canada.',
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
