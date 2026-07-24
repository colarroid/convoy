import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import Footer from '@/components/Footer'
import PostCardLink from '@/components/PostCardLink'
import { getPosts } from '@/lib/blog'

// Rebuild at most once a minute, so a newly published post appears without a
// deploy while the page still serves as static HTML to crawlers.
export const revalidate = 60

export default async function BlogPage() {
  const posts = await getPosts(50)
  const [featured, ...rest] = posts

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />

      {/* Sub-header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-3">
          <span className="text-sm font-semibold text-black">News and updates</span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 md:px-8 md:py-16">
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-black md:text-4xl">
          News and updates
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-500">
          Product changes, community stories, and what free community lift-sharing looks like in practice.
        </p>

        {posts.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 px-6 py-16 text-center">
            <p className="text-sm text-gray-500">No posts yet. Check back soon.</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            <div className="mt-10">
              <PostCardLink post={featured} featured />
            </div>

            {rest.length > 0 && (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <PostCardLink key={p.slug} post={p} />
                ))}
              </div>
            )}
          </>
        )}

        <p className="mt-14 text-center text-xs text-gray-400">
          Want Veesaa in your community?{' '}
          <Link href="/communities" className="font-semibold text-black hover:underline">
            See who is already sharing rides
          </Link>
          .
        </p>
      </div>

      <Footer />
    </div>
  )
}
