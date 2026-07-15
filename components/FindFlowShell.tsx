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
    <div className="min-h-screen lg:h-screen flex flex-col bg-white lg:overflow-hidden">
      <AppNav />

      <div className="flex flex-1 overflow-hidden lg:min-h-0">
        {/* ── Desktop hero panel (hidden on mobile) ── */}
        <div className="hidden lg:flex lg:w-[65%] bg-[#f5f4f1] flex-col items-start justify-end overflow-hidden border-r border-black/[0.04]">
          <div className="relative z-10 px-12 pb-14 max-w-xl">
            <h2 className="text-4xl lg:text-5xl font-bold text-black tracking-tight leading-[1.05] mb-4">
              Get there,<br />together<span className="text-blue-600">.</span>
            </h2>

            <p className="text-gray-500 text-base leading-relaxed mb-6">
              Find someone from your community already heading your way. No fare. No strangers. Just neighbours.
            </p>

            {communityName && (
              <div className="flex items-center gap-2.5 rounded-xl bg-white ring-1 ring-black/5 px-4 py-3">
                <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="text-sm font-semibold text-black">{communityName}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Form panel ── */}
        <div className="flex-1 lg:w-[35%] flex flex-col min-h-0">
          {/* Form content, scrolls on desktop, footer stays pinned */}
          <div className="flex-1 lg:min-h-0 lg:overflow-y-auto px-5 lg:px-8 pt-6 pb-6">
            {(context || title) && (
              <div className="mb-6">
                {context && <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600 mb-1.5">{context}</p>}
                {title && <h1 className="text-2xl font-bold text-black tracking-tight leading-snug">{title}</h1>}
                {subtitle && <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">{subtitle}</p>}
              </div>
            )}
            {children}
          </div>

          {/* Footer, sticky at bottom of form panel on desktop, fixed on mobile */}
          <div className="lg:static lg:border-t lg:border-gray-100 lg:px-8 lg:py-5
                          fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4">
            {footer}
          </div>
        </div>
      </div>
    </div>
  )
}
