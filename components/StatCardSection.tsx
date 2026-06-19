'use client'

interface StatCardSectionProps {
  headline?: string
  body?: string
  ctaLabel?: string
  onCta?: () => void
  statPrefix?: string
  statValue?: string
  statSuffix?: string
  statCaption?: string
}

/**
 * Bolt-style highlight card: bold headline + body + play CTA on the left,
 * a large stat on the right, a lightning glyph top-right. Responsive:
 * two columns on desktop, stacked on mobile. Pass content via props.
 */
export default function StatCardSection({
  headline = '77% of carts are abandoned. Veesaa brings them back.',
  body = 'Placeholder body copy. Replace with your own content describing the value in a sentence or two.',
  ctaLabel = 'Launch demo',
  onCta,
  statPrefix = '$',
  statValue = '1.972',
  statSuffix = 'T',
  statCaption = 'In revenue lost',
}: StatCardSectionProps) {
  return (
    <section className="bg-[#dadbeb] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-5xl rounded-[28px] bg-[#f6f7fb] px-7 py-9 shadow-[0_30px_80px_-40px_rgba(20,24,60,0.25)] sm:px-10 sm:py-12 md:px-16 md:py-16">
        <div className="grid items-center gap-10 md:grid-cols-[1.5fr_1fr] md:gap-12">
          {/* Left: headline, body, CTA */}
          <div className="relative">
            {/* lightning glyph, top-right of the whole card on desktop */}
            <h2 className="text-[34px] font-extrabold leading-[1.05] tracking-tight text-[#0a0a23] sm:text-5xl md:text-[56px]">
              {headline}
            </h2>
            <p className="mt-5 max-w-md text-base font-medium leading-relaxed text-[#3a3a52] sm:text-lg">
              {body}
            </p>

            {ctaLabel && (
              <button
                type="button"
                onClick={onCta}
                className="group mt-8 inline-flex items-center gap-3 text-[#0a0a23] sm:mt-12"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e3e4f0] transition-colors group-hover:bg-[#0a0a23] group-hover:text-white">
                  <svg className="ml-0.5 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </span>
                <span className="font-semibold">{ctaLabel}</span>
              </button>
            )}
          </div>

          {/* Right: lightning glyph + big stat */}
          <div className="flex flex-col items-start md:items-end">
            <svg className="mb-6 h-7 w-7 text-blue-600 md:mb-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13z" />
            </svg>

            <div className="flex items-start leading-none text-[#0a0a23]">
              <span className="mt-2 text-3xl font-bold sm:mt-3 sm:text-4xl">{statPrefix}</span>
              <span className="text-[64px] font-extrabold tracking-tight sm:text-[88px] md:text-[104px]">{statValue}</span>
              <span className="mt-2 self-end pb-2 text-3xl font-bold sm:text-4xl">{statSuffix}</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-blue-700 md:text-base">{statCaption}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
