import AppNav from '@/components/AppNav'

interface OfferFlowShellProps {
  context?: string
  title?: string
  subtitle?: string
  communityName?: string
  children: React.ReactNode
  footer: React.ReactNode
}

export default function OfferFlowShell({
  context,
  title,
  subtitle,
  communityName,
  children,
  footer,
}: OfferFlowShellProps) {
  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-white lg:overflow-hidden">
      <AppNav />

      <div className="flex flex-1 overflow-hidden lg:min-h-0">
        {/* ── Desktop hero panel ── */}
        <div className="hidden lg:flex lg:w-[65%] bg-black flex-col items-start justify-end overflow-hidden">
          <div className="relative z-10 px-12 pb-14 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              <span className="text-xs text-white/80 font-medium">Community lift-sharing · free to ride</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              Share your ride,<br />help your community.
            </h2>

            <p className="text-white/70 text-base leading-relaxed mb-6">
              Post your departure time and bring neighbours along your route for free. No fare, no app cut.
            </p>

            {communityName && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-white/60 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="text-sm text-white font-medium">{communityName}</span>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              {[
                { icon: '🔒', label: 'Closed community' },
                { icon: '📍', label: 'Pickup point only' },
                { icon: '✓', label: 'Rides, not ratings' },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1.5">
                  <span className="text-xs">{b.icon}</span>
                  <span className="text-xs text-white/70 whitespace-nowrap">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Form panel ── */}
        <div className="flex-1 lg:w-[35%] flex flex-col min-h-0">
          <div className="flex-1 lg:min-h-0 lg:overflow-y-auto px-5 lg:px-8 pt-6 pb-6">
            {(context || title) && (
              <div className="mb-6">
                {context && <p className="text-sm text-gray-400 mb-1">{context}</p>}
                {title && <h1 className="text-2xl font-bold text-black leading-snug">{title}</h1>}
                {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
              </div>
            )}
            {children}
          </div>

          <div className="lg:static lg:border-t lg:border-gray-100 lg:px-8 lg:py-5
                          fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4">
            {footer}
          </div>
        </div>
      </div>
    </div>
  )
}
