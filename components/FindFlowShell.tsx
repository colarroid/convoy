import AppNav from '@/components/AppNav'

interface FindFlowShellProps {
  /** Small label above title */
  context?: string
  title?: string
  subtitle?: string
  /** Community name shown on the desktop hero panel */
  communityName?: string
  children: React.ReactNode
  /** Back / Continue buttons */
  footer: React.ReactNode
}

export default function FindFlowShell({
  context,
  title,
  subtitle,
  communityName,
  children,
  footer,
}: FindFlowShellProps) {
  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-[#f5f4f1] lg:overflow-hidden">
      <AppNav />

      <div className="relative flex-1 lg:min-h-0 lg:overflow-hidden">
        {/* Same container as the navbar, so the content lines up with the logo. */}
        <div className="relative mx-auto w-full max-w-6xl px-5 md:px-8 lg:grid lg:h-full lg:grid-cols-2 lg:gap-12">
          {/* ── Desktop hero ── */}
          <div className="hidden lg:flex lg:flex-col lg:justify-end lg:pb-14 lg:pr-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-black tracking-tight leading-[1.05] mb-4">
              Get there,<br />together.
            </h2>

            <p className="text-gray-500 text-base leading-relaxed mb-6 max-w-md">
              Find someone from your community already heading your way. Free. No strangers. Just neighbours.
            </p>

            {communityName && (
              <div className="inline-flex items-center gap-2.5 self-start rounded-xl bg-white ring-1 ring-black/5 px-4 py-3">
                <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="text-sm font-semibold text-black">{communityName}</span>
              </div>
            )}
          </div>

          {/* ── Form column. On desktop the card fills the column so the CTAs
                 sit inside it, at the same place they already were. ── */}
          <div className="flex flex-col py-6 lg:h-full lg:min-h-0 lg:py-8">
            <div className="flex flex-1 flex-col rounded-2xl border border-gray-200 bg-white lg:min-h-0">
              <div className="flex-1 p-5 md:p-6 lg:min-h-0 lg:overflow-y-auto">
                {(context || title) && (
                  <div className="mb-6">
                    {context && <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600 mb-1.5">{context}</p>}
                    {title && <h1 className="text-2xl font-bold text-black tracking-tight leading-snug">{title}</h1>}
                    {subtitle && <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">{subtitle}</p>}
                  </div>
                )}
                {children}
              </div>

              {/* Pinned to the viewport on mobile, part of the card on desktop. */}
              <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-black/[0.06] bg-[#f5f4f1] px-5 py-4
                              lg:static lg:z-auto lg:rounded-b-2xl lg:border-gray-100 lg:bg-white lg:px-6 lg:py-5">
                {footer}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
