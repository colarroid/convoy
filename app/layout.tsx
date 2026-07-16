import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import CookieNotice from '@/components/CookieNotice'
import OneSignalInit from '@/components/OneSignalInit'
import AuthGate from '@/components/AuthGate'
import InstallPrompt from '@/components/InstallPrompt'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, LEGAL_NAME, OG_IMAGE } from '@/lib/seo'
import { siteGraph } from '@/lib/jsonLd'

const sans = localFont({
  src: [
    // Regular body uses News (heavier than Book so text isn't thin)
    { path: '../assets/font/Book.woff2',   weight: '300', style: 'normal' },
    { path: '../assets/font/News.woff2',   weight: '400', style: 'normal' },
    { path: '../assets/font/Medium.woff2', weight: '500', style: 'normal' },
    { path: '../assets/font/Medium.woff2', weight: '600', style: 'normal' },
    // Bold + extra-bold use the heavier new bold cut
    { path: '../assets/font/Ubermove-bold-new 1.woff', weight: '700', style: 'normal' },
    { path: '../assets/font/Ubermove-bold-new 1.woff', weight: '800', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['Helvetica Neue', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Veesaa | Free community lift-sharing to shared destinations',
    template: '%s | Veesaa',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'community lift-sharing', 'carpooling', 'carpool app', 'free carpooling',
    'ride sharing', 'shared rides', 'community carpool', 'commuting together',
    'carpooling Nigeria', 'carpooling Canada', 'community code', 'Veesaa',
  ],
  authors: [{ name: LEGAL_NAME, url: SITE_URL }],
  creator: LEGAL_NAME,
  publisher: LEGAL_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    url: SITE_URL,
    title: 'Veesaa | Free community lift-sharing to shared destinations',
    description: SITE_DESCRIPTION,
    locale: 'en',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veesaa | Free community lift-sharing',
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'travel',
  // Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION to the token Google Search Console
  // gives you, and the verification meta tag is emitted automatically.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Veesaa',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <head>
        {/* Describes the product to search engines and AI assistants. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraph()) }}
        />
      </head>
      <body className="font-sans">
        <AuthGate />
        {children}
        <CookieNotice />
        <InstallPrompt />
        <OneSignalInit />
      </body>
    </html>
  )
}
