import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBlogPosts } from '@/lib/api'
import { buildTitle, canonicalUrl } from '@/lib/seo'
import { BookOpen, Leaf, Mail } from 'lucide-react'

type SearchParams = Promise<{ page?: string; tag?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams
  return {
    title: buildTitle(['Blog vegan & végétarien']),
    description: 'Actualités, recettes, conseils et guides sur l\'alimentation vegan et végétarienne en France.',
    alternates: { canonical: canonicalUrl('/blog') },
    robots: sp.page && Number(sp.page) > 1 ? { index: false } : undefined,
  }
}

const BLOG_TAGS = ['Recettes', 'Conseils', 'Actualités', 'Restaurants', 'Nutrition', 'Mode de vie']

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const page = Number(sp.page ?? 1)

  const result = await getBlogPosts({ page, limit: 12, tag: sp.tag }).catch(
    () => ({ data: [], total: 0, page: 1, limit: 12, hasNextPage: false }),
  )

  const [featured, ...rest] = result.data

  return (
    <>
      {/* Hero */}
      <section className="bg-leaf-pattern py-14 px-4" style={{ background: '#FDF6EC' }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4">
            <BookOpen size={22} className="text-green-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
            Le blog vegan & végétarien
          </h1>
          <p className="text-gray-500 mb-6">
            Recettes, guides, actualités et conseils pour vivre mieux en France.
          </p>
          {/* Tag filters */}
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/blog"
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !sp.tag ? 'text-white' : 'border text-gray-600 hover:border-green-400 hover:text-green-700 bg-white'
              }`}
              style={!sp.tag ? { background: '#40916C' } : { borderColor: '#E5E7EB' }}
            >
              Tous
            </Link>
            {BLOG_TAGS.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  sp.tag === tag ? 'text-white' : 'border text-gray-600 hover:border-green-400 hover:text-green-700 bg-white'
                }`}
                style={sp.tag === tag ? { background: '#40916C' } : { borderColor: '#E5E7EB' }}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {result.data.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400">Aucun article publié pour l&apos;instant.</p>
          </div>
        ) : (
          <>
            {/* Featured article */}
            {featured && page === 1 && (
              <Link
                href={`/blog/${featured.slug}`}
                className="group flex flex-col lg:flex-row bg-white rounded-3xl overflow-hidden border border-gray-100 mb-10 card-hover"
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
              >
                <div className="relative lg:w-3/5 h-56 lg:h-auto bg-gradient-to-br from-green-50 to-emerald-100">
                  {featured.cover_image ? (
                    <Image
                      src={featured.cover_image}
                      alt={featured.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Leaf size={48} className="text-green-200" />
                    </div>
                  )}
                </div>
                <div className="lg:w-2/5 p-6 sm:p-8 flex flex-col justify-center">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {featured.tags?.slice(0, 2).map((tag: string) => (
                      <span key={tag} className="text-xs bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2
                    className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors leading-snug"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{featured.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
                    <span>
                      {new Date(featured.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-green-600 font-medium group-hover:underline">Lire →</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Articles grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(page === 1 ? rest : result.data).map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white border border-gray-100 rounded-2xl overflow-hidden card-hover"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                >
                  <div className="relative h-44 bg-gradient-to-br from-green-50 to-emerald-100 overflow-hidden">
                    {post.cover_image ? (
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Leaf size={36} className="text-green-200" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {post.tags?.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2
                      className="font-semibold text-gray-900 mb-1 group-hover:text-green-700 transition-colors line-clamp-2 text-sm"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {post.title}
                    </h2>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(post.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                      {post.author?.name && ` · ${post.author.name}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {(page > 1 || result.hasNextPage) && (
          <div className="flex justify-center items-center gap-2 mt-12">
            {page > 1 && (
              <Link
                href={`/blog?${new URLSearchParams({ ...(sp.tag ? { tag: sp.tag } : {}), page: String(page - 1) })}`}
                className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#E5E7EB' }}
              >
                ← Précédent
              </Link>
            )}
            <span className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#40916C' }}>
              {page}
            </span>
            {result.hasNextPage && (
              <Link
                href={`/blog?${new URLSearchParams({ ...(sp.tag ? { tag: sp.tag } : {}), page: String(page + 1) })}`}
                className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#E5E7EB' }}
              >
                Suivant →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Newsletter CTA */}
      <section className="py-14 px-4" style={{ background: '#1B4332' }}>
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-700 mb-4">
            <Mail size={18} className="text-green-300" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            La newsletter vegan
          </h2>
          <p className="text-green-300 text-sm mb-6">
            Les meilleures adresses et recettes chaque semaine.
          </p>
          <form className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="votre@email.fr"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-white/10 border border-white/20 text-white placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: '#F4845F' }}
            >
              S&apos;abonner
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
