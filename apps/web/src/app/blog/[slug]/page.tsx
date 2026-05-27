import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Mail, Calendar, User, Share2, ArrowLeft, Leaf } from 'lucide-react'
import { getBlogPost, getBlogSlugs, getBlogPosts } from '@/lib/api'
import { buildTitle, canonicalUrl, truncate, SITE_URL, SITE_NAME } from '@/lib/seo'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await getBlogSlugs().catch(() => [])
  return slugs.map((slug) => ({ slug }))
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug).catch(() => null)
  if (!post) return {}

  const title = post.seo_title ?? buildTitle([post.title])
  const description = post.seo_description ?? truncate(post.excerpt ?? post.content, 160)

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(`/blog/${slug}`) },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalUrl(`/blog/${slug}`),
      publishedTime: post.published_at,
      authors: post.author.name ? [post.author.name] : undefined,
      images: post.cover_image ? [{ url: post.cover_image, alt: post.title }] : [],
    },
  }
}

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [post, related] = await Promise.all([
    getBlogPost(slug).catch(() => null),
    getBlogPosts({ page: 1, limit: 4 }).catch(() => ({ data: [] })),
  ])
  if (!post) notFound()

  const relatedPosts = (related.data as Array<{ id: string; slug: string; title: string; cover_image: string | null; published_at: string }>)
    .filter((p) => p.slug !== slug)
    .slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_image ? [post.cover_image] : undefined,
    datePublished: post.published_at,
    author: { '@type': 'Person', name: post.author.name ?? SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    url: canonicalUrl(`/blog/${slug}`),
  }

  const minutes = readingTime(post.content)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative h-72 sm:h-96 overflow-hidden">
        {post.cover_image ? (
          <Image src={post.cover_image} alt={post.title} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1B4332, #2D6A4F)' }}>
            <Leaf size={120} className="text-white opacity-10" />
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-4 sm:px-6 pb-8">
          <Breadcrumb
            light
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: post.title },
            ]}
          />
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full text-white" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}>
                {tag}
              </span>
            ))}
          </div>
          <h1
            className="text-2xl sm:text-4xl font-bold text-white leading-tight mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {new Date(post.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            {post.author.name && (
              <span className="flex items-center gap-1.5">
                <User size={13} />
                {post.author.name}
              </span>
            )}
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{minutes} min de lecture</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Article */}
          <article className="lg:col-span-2">
            {post.excerpt && (
              <p
                className="text-lg leading-relaxed mb-8 pl-5 italic"
                style={{ color: '#F4845F', borderLeft: '3px solid #F4845F', fontFamily: 'var(--font-display)' }}
              >
                {post.excerpt}
              </p>
            )}

            <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full hover:bg-green-100 transition-colors font-medium"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            {/* Author card */}
            {post.author.name && (
              <div className="mt-8 rounded-2xl p-6 flex items-center gap-4" style={{ background: '#FDF6EC' }}>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{ background: 'linear-gradient(135deg, #40916C, #1B4332)' }}
                >
                  {post.author.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>{post.author.name}</p>
                  <p className="text-sm text-gray-500">Rédacteur France Veg</p>
                </div>
              </div>
            )}

            {/* Back */}
            <div className="mt-8">
              <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: '#40916C' }}>
                <ArrowLeft size={14} />
                Retour au blog
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Share */}
            <div className="rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Share2 size={14} className="text-green-600" />
                Partager l&apos;article
              </p>
              <div className="space-y-2.5">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl(`/blog/${slug}`))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-xs">f</span>
                  </div>
                  Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(canonicalUrl(`/blog/${slug}`))}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    <span className="text-gray-800 font-bold text-xs">𝕏</span>
                  </div>
                  X / Twitter
                </a>
              </div>
            </div>

            {/* Newsletter */}
            <div className="rounded-2xl p-5 text-white" style={{ background: '#1B4332' }}>
              <div className="w-8 h-8 rounded-xl bg-green-700 flex items-center justify-center mb-3">
                <Mail size={15} className="text-green-300" />
              </div>
              <p className="font-semibold mb-1 text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                Newsletter vegan
              </p>
              <p className="text-xs mb-4 leading-relaxed" style={{ color: '#86EFAC' }}>
                Les meilleures adresses et recettes chaque semaine.
              </p>
              <form className="space-y-2">
                <input
                  type="email"
                  placeholder="votre@email.fr"
                  className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl text-sm font-semibold text-white transition-colors"
                  style={{ background: '#F4845F' }}
                >
                  S&apos;abonner
                </button>
              </form>
            </div>

            {/* Explore tags */}
            <div className="rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <p className="text-sm font-semibold text-gray-700 mb-3">Explorer le blog</p>
              {['Recettes', 'Conseils', 'Actualités', 'Restaurants', 'Nutrition'].map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="flex items-center justify-between py-2 text-sm text-gray-600 hover:text-green-600 border-b border-gray-50 last:border-0 transition-colors"
                >
                  <span>{tag}</span>
                  <ChevronRight size={14} className="text-gray-300" />
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {/* Related articles */}
      {relatedPosts.length > 0 && (
        <section className="py-12 px-4" style={{ background: '#FDF6EC' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              Articles similaires
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 card-hover"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                >
                  <div className="relative h-36 bg-gradient-to-br from-green-50 to-emerald-100 overflow-hidden">
                    {p.cover_image && (
                      <Image
                        src={p.cover_image}
                        alt={p.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3
                      className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-green-700 transition-colors"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {p.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(p.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
