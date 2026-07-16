import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import CookieNotice from '@/components/CookieNotice'
import OneSignalInit from '@/components/OneSignalInit'
import AuthGate from '@/components/AuthGate'
import InstallPrompt from '@/components/InstallPrompt'

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
  title: 'Veesaa · Community lift-sharing',
  description: 'Veesaa connects people in your community heading to the same place at the same time, so you ride together. Free. Trusted. Community-first.',
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
