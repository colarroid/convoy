import Link from 'next/link'

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
      { href: '/help', label: 'Help' },
    ],
  },
  {
    title: 'Support',
    links: [
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
            <Link href="/" className="text-2xl font-bold tracking-tight text-white">Veesaa</Link>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Community lift-sharing built around shared destinations and the people you already trust.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-white/60">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-400" />
              </span>
              Live in Nigeria &amp; Canada
            </p>
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
          <p className="text-xs text-white/40">© {new Date().getFullYear()} Veesaa</p>
          <div className="flex items-center gap-6">
            {LEGAL.map((l) => (
              <Link key={l.href} href={l.href} className="text-xs text-white/50 transition-colors hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Giant watermark, cropped at the bottom edge */}
      <div aria-hidden className="mt-10 overflow-hidden md:mt-12">
        <p
          className="select-none text-center font-bold leading-[0.78] tracking-tighter text-white/[0.05]"
          style={{ fontSize: 'clamp(88px, 19vw, 250px)', marginBottom: '-0.16em' }}
        >
          Veesaa
        </p>
      </div>
    </footer>
  )
}
