interface HopeNationBadgeProps {
  /** Tailwind size classes, e.g. "w-12 h-12" */
  className?: string
}

/** Small recreation of the Hope Nation church logo badge (no asset needed). */
export default function HopeNationBadge({ className = 'w-12 h-12' }: HopeNationBadgeProps) {
  return (
    <div className={`bg-black rounded-xl flex flex-col items-center justify-center shrink-0 ${className}`}>
      <span className="text-white font-bold tracking-[0.18em] leading-none" style={{ fontSize: '0.42rem' }}>HOPE</span>
      <span className="font-black leading-none" style={{ color: '#e0322b', fontSize: '0.8rem' }}>NATION</span>
    </div>
  )
}
