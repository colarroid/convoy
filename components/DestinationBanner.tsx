/** Shows the trip destination (the community) so members know the code already
 *  set where they're going, and the next step is their own pickup point. */
export default function DestinationBanner({ name, address }: { name?: string; address?: string | null }) {
  if (!name) return null
  return (
    <div className="mb-5 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5">
      <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400">
        <svg className="h-3.5 w-3.5 text-blue-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21l1.18-6.88-5-4.87 7.1-1.01L12 2z" />
        </svg>
        Destination
      </p>
      <p className="text-sm font-bold leading-snug text-black">{name}</p>
      {address && <p className="mt-0.5 text-xs text-gray-500">{address}</p>}
    </div>
  )
}
