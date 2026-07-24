import Link from 'next/link'
import { formatPostDate, type PostCard } from '@/lib/blog'

/**
 * A blog post as a card. `featured` is the wide two-column treatment used at the
 * top of the index and on the landing section; the default is the compact card
 * used in grids.
 */
export default function PostCardLink({ post, featured = false }: { post: PostCard; featured?: boolean }) {
  if (featured) {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group grid overflow-hidden rounded-2xl border border-gray-200 transition-all hover:border-gray-300 hover:shadow-sm sm:grid-cols-2"
      >
        <span className="relative block aspect-[16/10] bg-gray-100 sm:aspect-auto sm:h-full sm:min-h-[260px]">
          {post.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
        </span>
        <span className="flex flex-col justify-center p-6 md:p-8">
          <span className="flex items-center justify-between gap-3 text-xs text-gray-500">
            <span className="font-semibold text-black">{post.category || 'News'}</span>
            <span>{formatPostDate(post.published_at)}</span>
          </span>
          <span className="mt-3 block text-xl font-bold leading-snug tracking-tight text-black md:text-2xl">
            {post.title}
          </span>
          {post.excerpt && (
            <span className="mt-3 block text-sm leading-relaxed text-gray-500 line-clamp-3">{post.excerpt}</span>
          )}
        </span>
      </Link>
    )
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 transition-all hover:border-gray-300 hover:shadow-sm"
    >
      <span className="relative block aspect-[16/10] bg-gray-100">
        {post.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
      </span>
      <span className="flex flex-1 flex-col p-5">
        <span className="flex items-center justify-between gap-3 text-xs text-gray-500">
          <span className="font-semibold text-black">{post.category || 'News'}</span>
          <span>{formatPostDate(post.published_at)}</span>
        </span>
        <span className="mt-2 block text-base font-bold leading-snug tracking-tight text-black">
          {post.title}
        </span>
        {post.excerpt && (
          <span className="mt-2 block text-sm leading-relaxed text-gray-500 line-clamp-2">{post.excerpt}</span>
        )}
      </span>
    </Link>
  )
}
