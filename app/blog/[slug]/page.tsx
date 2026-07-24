import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import SiteHeader from '@/components/SiteHeader'
import Footer from '@/components/Footer'
import PostCardLink from '@/components/PostCardLink'
import { getPost, getPosts, formatPostDate, readingMinutes } from '@/lib/blog'
import { SITE_URL, SITE_NAME, OG_IMAGE } from '@/lib/seo'

export const revalidate = 60

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return { title: 'Post not found' }

  const description = post.excerpt ?? undefined
  const image = post.cover_url ?? OG_IMAGE.url

  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: `/blog/${post.slug}`,
      images: [image],
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
    },
    twitter: { card: 'summary_large_image', title: post.title, description, images: [image] },
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  // A few more to read, excluding this one.
  const more = (await getPosts(4)).filter((p) => p.slug !== post.slug).slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${SITE_URL}/blog/${post.slug}#post`,
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_url ?? OG_IMAGE.url,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { '@type': 'Organization', name: post.author_name || SITE_NAME, url: SITE_URL },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
    articleSection: post.category ?? undefined,
    inLanguage: 'en',
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Sub-header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-3">
          <Link href="/blog" className="text-sm font-semibold text-gray-500 transition-colors hover:text-black">
            ← News and updates
          </Link>
        </div>
      </div>

      <article className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 md:px-8 md:py-16">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="font-semibold text-black">{post.category || 'News'}</span>
          <span aria-hidden>·</span>
          <time dateTime={post.published_at}>{formatPostDate(post.published_at)}</time>
          <span aria-hidden>·</span>
          <span>{readingMinutes(post.body_md)} min read</span>
        </div>

        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-black md:text-4xl">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-4 text-base leading-relaxed text-gray-500">{post.excerpt}</p>
        )}

        {post.author_name && (
          <p className="mt-6 text-sm text-gray-500">By {post.author_name}</p>
        )}

        {post.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_url}
            alt=""
            className="mt-8 w-full rounded-2xl border border-gray-200 object-cover"
          />
        )}

        <div className="post-body mt-10">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body_md}</ReactMarkdown>
        </div>
      </article>

      {more.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="mx-auto w-full max-w-5xl px-5 py-12 md:px-8 md:py-16">
            <h2 className="text-lg font-bold tracking-tight text-black">More from Veesaa</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => (
                <PostCardLink key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
