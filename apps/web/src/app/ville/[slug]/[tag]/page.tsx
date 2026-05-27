import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getRestaurants, getRegion, getTagCoverage } from '@/lib/api'
import { RestaurantCard } from '@/components/ui/RestaurantCard'
import { buildTitle, truncate, canonicalUrl } from '@/lib/seo'
import { TAGS, tagBySlug } from '@/lib/tags'

type Props = {
  params: Promise<{ slug: string; tag: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateStaticParams() {
  const coverage = await getTagCoverage().catch(() => [])
  return coverage
    .map((c) => {
      const tagConfig = TAGS.find((t) => t.dbValue === c.tag)
      if (!tagConfig) return null
      return { slug: c.regionSlug, tag: tagConfig.slug }
    })
    .filter((p): p is { slug: string; tag: string } => p !== null)
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, tag: tagSlug } = await params
  const tagConfig = tagBySlug(tagSlug)
  if (!tagConfig) return {}

  const regionData = await getRegion(slug).catch(() => null)
  if (!regionData) return {}

  const { region } = regionData
  const title = buildTitle([`Restaurants ${tagConfig.adjective} à ${region.name}`])
  const description = truncate(
    `Les meilleurs restaurants ${tagConfig.label} à ${region.name}. Adresses, horaires et avis.`,
  )

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(`/ville/${slug}/${tagSlug}`) },
    openGraph: { title, description, url: canonicalUrl(`/ville/${slug}/${tagSlug}`) },
  }
}

export default async function CityTagPage({ params, searchParams }: Props) {
  const { slug, tag: tagSlug } = await params
  const tagConfig = tagBySlug(tagSlug)
  if (!tagConfig) notFound()

  const sp = await searchParams
  const page = Number(sp.page ?? 1)

  const [regionData, result] = await Promise.all([
    getRegion(slug).catch(() => null),
    getRestaurants({ region_slug: slug, tags: [tagConfig.dbValue], page, limit: 18 }).catch(() => ({
      data: [], total: 0, page: 1, limit: 18, hasNextPage: false,
    })),
  ])

  if (!regionData) notFound()
  const { region } = regionData

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-green-600">Accueil</Link>
        <span>/</span>
        <Link href="/restaurants" className="hover:text-green-600">Restaurants</Link>
        <span>/</span>
        <Link href={`/restaurants/${tagSlug}`} className="hover:text-green-600 capitalize">{tagConfig.label}</Link>
        <span>/</span>
        <span className="text-gray-600">{region.name}</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Restaurants {tagConfig.adjective} à {region.name}
      </h1>
      <p className="text-gray-500 mb-8">{result.total} adresses trouvées</p>

      {/* Switch tag for same city */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href={`/ville/${slug}`}
          className="text-xs border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 px-3 py-1.5 rounded-full transition-colors"
        >
          Tous les restaurants
        </Link>
        {TAGS.filter((t) => t.slug !== tagSlug).map((t) => (
          <Link
            key={t.slug}
            href={`/ville/${slug}/${t.slug}`}
            className="text-xs bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-700 px-3 py-1.5 rounded-full transition-colors"
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Restaurant grid */}
      {result.data.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Aucun restaurant {tagConfig.label} à {region.name}.</p>
          <Link href={`/ville/${slug}`} className="mt-4 inline-block text-green-600 hover:underline">
            Voir tous les restaurants à {region.name}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {result.data.map((r) => (
            <RestaurantCard key={r.id} r={r} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {(page > 1 || result.hasNextPage) && (
        <div className="flex justify-center gap-3 mt-12">
          {page > 1 && (
            <Link
              href={`/ville/${slug}/${tagSlug}?page=${page - 1}`}
              className="px-5 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              ← Précédent
            </Link>
          )}
          {result.hasNextPage && (
            <Link
              href={`/ville/${slug}/${tagSlug}?page=${page + 1}`}
              className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              Suivant →
            </Link>
          )}
        </div>
      )}
    </main>
  )
}
