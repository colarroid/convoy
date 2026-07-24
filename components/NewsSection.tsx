'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PostCardLink from '@/components/PostCardLink'
import { formatPostDate, getPosts, type PostCard } from '@/lib/blog'

/**
 * Landing-page "News and updates": one featured post beside a stacked list of
 * the next few. The landing page is a client component, so this fetches on the
 * client; the blog pages themselves are server-rendered for search engines.
 * Renders nothing until there is at least one published post, so the section
 * never appears as an empty shell.
 */
export default function NewsSection() {
  const [posts, setPosts] = useState<PostCard[]>([])

  useEffect(() => {
    getPosts(4).then(setPosts).catch(() => {})
  }, [])

  if (posts.length === 0) return null

  const [featured, ...rest] = posts

  return (
    <section className="bg-gray-50 px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold tracking-tight text-black md:text-5xl">News and updates</h2>

        <Link
          href="/blog"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-200/70 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gray-200"
        >
          View all
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H8M17 7v9" />
          </svg>
        </Link>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <PostCardLink post={featured} featured />

          {rest.length > 0 && (
            <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4">
              {rest.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex items-center gap-4 rounded-xl p-2 transition-colors hover:bg-gray-50"
                >
                  <span className="relative block h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {p.cover_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold leading-snug text-black line-clamp-2">
                      {p.title}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">{formatPostDate(p.published_at)}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
