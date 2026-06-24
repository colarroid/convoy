const TESTIMONIALS = [
  {
    quote:
      "I used to drive to service alone every Sunday. Now three of us go together and it's the best part of the morning.",
    name: 'Amara O.',
    community: 'Grace Chapel',
  },
  {
    quote:
      'Match-days are sorted. I ride with people from my estate and we split nothing but good conversation.',
    name: 'Tunde A.',
    community: 'Northgate Estate',
  },
  {
    quote:
      'As a parent, knowing it is only verified neighbours in the car gives me real peace of mind.',
    name: 'Chidinma E.',
    community: 'Riverside Hall',
  },
]

const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export default function TestimonialsSection() {
  return (
    <section className="bg-white px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="text-[11px] font-bold uppercase text-blue-600">Loved by communities</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-black md:text-4xl">
          Neighbours, getting there together.
        </h2>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-3xl bg-[#f5f4f1] p-7"
            >
              <blockquote className="flex-1 text-[1.05rem] leading-relaxed text-[#0a0a23]">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  {initials(t.name)}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-black">{t.name}</span>
                  <span className="block truncate text-xs text-gray-500">{t.community}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
