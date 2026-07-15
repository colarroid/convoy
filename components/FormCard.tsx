/**
 * Grouped form styling: one rounded card, fields stacked with hairline
 * dividers, tiny uppercase labels above borderless inputs.
 */

export const formInput =
  'w-full min-w-0 flex-1 bg-transparent text-[15px] text-black placeholder-gray-300 focus:outline-none'

export const formLabel =
  'text-[10px] font-semibold uppercase tracking-[0.10em] text-gray-400 transition-colors group-focus-within:text-black'

export function FormCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[#e1dee7] bg-white divide-y divide-[#e1dee7] shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${className}`}>
      {children}
    </div>
  )
}

export function FormRow({
  label,
  labelRight,
  children,
  className = '',
}: {
  label: string
  labelRight?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`group px-5 pt-3.5 pb-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <span className={formLabel}>{label}</span>
        {labelRight}
      </div>
      <div className="mt-1.5 flex items-center gap-2">{children}</div>
    </div>
  )
}
