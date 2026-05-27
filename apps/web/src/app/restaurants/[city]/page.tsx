import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getRestaurants, getTagCoverage, getRegions } from '@/lib/api'
import { RestaurantCard } from '@/components/ui/RestaurantCard'
import { buildTitle, truncate, canonicalUrl } from '@/lib/seo'
import { TAGS, tagBySlug } from '@/lib/tags'

type Props = {
  params: Promise<{ city: string }>
  searchParams: Promise<{ page?: string }>
}

export function generateStaticParams() {
  return TAGS.map((t) => ({ city: t.slug }))
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: tagSlug } = await params
  const tagConfig = tagBySlug(tagSlug)
  if (!tagConfig) return {}

  const title = buildTitle([`Restaurants ${tagConfig.adjective} en France`])
  const description = truncate(
    `Les meilleurs restaurants ${tagConfig.label} en France. Adresses complètes, horaires d'ouverture, avis et informations pratiques.`,
  )

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(`/restaurants/${tagSlug}`) },
    openGraph: { title, description, url: canonicalUrl(`/restaurants/${tagSlug}`) },
  }
}

export default async function TagPage({ params, searchParams }: Props) {
  const { city: tagSlug } = await params
  const tagConfig = tagBySlug(tagSlug)
  if (!tagConfig) notFound()

  const sp = await searchParams
  const page = Number(sp.page ?? 1)

  const [result, coverage, allRegions] = await Promise.all([
    getRestaurants({ tags: [tagConfig.dbValue], page, limit: 18 }).catch(() => ({
      data: [], total: 0, page: 1, limit: 18, hasNextPage: false,
    })),
    getTagCoverage().catch(() => []),
    getRegions().catch(() => []),
  ])

  const cityLinks = allRegions
    .filter((r) =>
      r.type === 'city' &&
      coverage.some((c) => c.tag === tagConfig.dbValue && c.regionSlug === r.slug),
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <nav className="flex items-center gap-1 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-green-600">Accueil</Link>
        <span>/</span>
        <Link href="/restaurants" className="hover:text-green-600">Restaurants</Link>
        <span>/</span>
        <span className="text-gray-600 capitalize">{tagConfig.label}</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Restaurants {tagConfig.adjective} en France
      </h1>
      <p className="text-gray-500 mb-8">{result.total} adresses trouvées</p>

      {cityLinks.length > 0 && (
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-3">Par ville :</p>
          <div className="flex flex-wrap gap-2">
            {cityLinks.map((city) => (
              <Link
                key={city.slug}
                href={`/ville/${city.slug}/${tagSlug}`}
                className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-full transition-colors"
              >
                {tagConfig.label} à {city.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {result.data.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Aucun restaurant trouvé.</p>
          <Link href="/restaurants" className="mt-4 inline-block text-green-600 hover:underline">
            Voir tous les restaurants
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {result.data.map((r) => (
            <RestaurantCard key={r.id} r={r} />
          ))}
        </div>
      )}

      {(page > 1 || result.hasNextPage) && (
        <div className="flex justify-center gap-3 mt-12">
          {page > 1 && (
            <Link href={`/restaurants/${tagSlug}?page=${page - 1}`} className="px-5 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              ← Précédent
            </Link>
          )}
          {result.hasNextPage && (
            <Link href={`/restaurants/${tagSlug}?page=${page + 1}`} className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">
              Suivant →
            </Link>
          )}
        </div>
      )}

      <div className="mt-12 pt-8 border-t border-gray-100">
        <h2 className="text-sm font-semibold text-gray-600 mb-3">Explorer par régime alimentaire</h2>
        <div className="flex flex-wrap gap-2">
          {TAGS.filter((t) => t.slug !== tagSlug).map((t) => (
            <Link key={t.slug} href={`/restaurants/${t.slug}`} className="text-xs border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 px-3 py-1.5 rounded-full transition-colors">
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
