/** Landing manifesto — explains the concept (free community lift-sharing). */
export default function ManifestoSection() {
  return (
    <section className="bg-black text-white py-20 md:py-28 px-5 md:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold leading-tight tracking-tight">
          Veesaa was built for how your community already moves.
        </h2>
        <div className="mt-8 space-y-5 text-lg md:text-xl text-gray-400 leading-relaxed">
          <p>Every day, people from the same community head to the same place at the same time — and travel separately.</p>
          <p>Veesaa connects them, so they go together. The destination is the point, not the fare.</p>
          <p className="text-white">No charges. No strangers. Just your community, getting there together.</p>
        </div>
      </div>
    </section>
  )
}
