import Link from 'next/link'
import { SOCIAL_LINKS } from '@/lib/seo'

/** Brand profiles shown as icon links. Add a network to SOCIAL_LINKS and an icon here. */
const SOCIALS = [
  {
    href: SOCIAL_LINKS.linkedin,
    label: 'Veesaa on LinkedIn',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
      </svg>
    ),
  },
]

interface FooterProps {
  /** id for anchor links (e.g. "contact" on the landing page) */
  id?: string
  /** kept for call-site compatibility; overlays float above the footer now */
  mobileSpacer?: boolean
}

const SUPPORT_EMAIL = 'hello@veesaa.co'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '/communities', label: 'Communities' },
      { href: '/experiences', label: 'Experiences' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/how-it-works', label: 'How it works' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '/help', label: 'Help' },
      { href: `mailto:${SUPPORT_EMAIL}`, label: SUPPORT_EMAIL },
    ],
  },
]

const LEGAL = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms-of-use', label: 'Terms of Use' },
]

export default function Footer({ id }: FooterProps) {
  return (
    <footer id={id} className="mt-auto bg-black text-white">
      <div className="mx-auto max-w-6xl px-5 pt-16 md:px-8 md:pt-20">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between md:gap-8">
          {/* Brand + tagline */}
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/veesaa-logo-white.svg" alt="Veesaa" className="h-[17px] w-auto" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Community lift-sharing built around shared destinations and the people you already trust.
            </p>

            {/* Brand profiles */}
            <div className="mt-6 flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-10 sm:flex sm:gap-16 md:gap-20">
            {COLUMNS.map((col) => (
              <nav key={col.title}>
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">{col.title}</p>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="group inline-flex items-center gap-1.5 text-sm text-white/65 transition-colors hover:text-white"
                      >
                        {l.label}
                        <svg className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between md:mt-16">
          <p className="text-xs text-white/40">VZA Technologies Limited © {new Date().getFullYear()}</p>
          <div className="flex items-center gap-6">
            {LEGAL.map((l) => (
              <Link key={l.href} href={l.href} className="text-xs text-white/50 transition-colors hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Giant logo watermark, cropped at the bottom edge */}
      <div aria-hidden className="mt-10 overflow-hidden px-5 md:mt-12 md:px-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/veesaa-logo-white.svg"
          alt=""
          className="mx-auto w-full max-w-6xl select-none opacity-[0.05]"
          style={{ marginBottom: '-7%' }}
        />
      </div>
    </footer>
  )
}
