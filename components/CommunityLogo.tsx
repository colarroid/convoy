interface CommunityLogoProps {
  src?: string | null
  name?: string | null
  /** Tailwind size, e.g. "w-12 h-12". Keep consistent across the app. */
  className?: string
}

/** A community's logo as a rounded square, with an initial fallback. */
export default function CommunityLogo({ src, name, className = 'w-12 h-12' }: CommunityLogoProps) {
  return (
    <div className={`rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center shrink-0 ${className}`}>
      {src
        ? <img src={src} alt={name ?? 'Community'} className="w-full h-full object-cover" />
        : <span className="text-white font-bold">{(name?.trim()?.[0] ?? 'C').toUpperCase()}</span>}
    </div>
  )
}
