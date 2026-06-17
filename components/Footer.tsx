import Link from 'next/link'

interface FooterProps {
  /** id for anchor links (e.g. "contact" on the landing page) */
  id?: string
  /** extra bottom margin on mobile to clear fixed bars */
  mobileSpacer?: boolean
}

const LINKS = [
  { href: '/privacy',       label: 'Privacy' },
  { href: '/terms-of-use',  label: 'Terms of Use' },
]

export default function Footer({ id, mobileSpacer = false }: FooterProps) {
  return (
    <footer
      id={id}
      className={`border-t border-gray-100 bg-white mt-auto ${mobileSpacer ? 'mb-16 md:mb-0' : ''}`}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} Veesaa</p>

        <div className="flex items-center gap-6 flex-wrap">
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
