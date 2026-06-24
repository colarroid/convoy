import Link from 'next/link'

interface FooterProps {
  /** id for anchor links (e.g. "contact" on the landing page) */
  id?: string
  /** extra bottom margin on mobile to clear fixed bars */
  mobileSpacer?: boolean
}

const SUPPORT_EMAIL = 'hello@veesaa.co'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '/communities', label: 'Communities' },
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

export default function Footer({ id, mobileSpacer = false }: FooterProps) {
  return (
    <footer
      id={id}
      className={`bg-black text-white mt-auto ${mobileSpacer ? 'mb-16 md:mb-0' : ''}`}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between md:gap-8">
          {/* Brand + tagline */}
          <div className="max-w-sm">
            <Link href="/" className="text-2xl font-bold tracking-tight text-white">Veesaa</Link>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Community lift-sharing built around shared destinations and the people you already trust.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:flex sm:gap-16 md:gap-24">
            {COLUMNS.map((col) => (
              <nav key={col.title}>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">{col.title}</p>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-white/70 transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between md:mt-14">
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
    </footer>
  )
}
