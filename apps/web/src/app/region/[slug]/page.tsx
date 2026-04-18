import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getRegion, getRegionSlugs } from '@/lib/api'
import { RestaurantCard } from '@/components/ui/RestaurantCard'
import { buildTitle, truncate, canonicalUrl } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await getRegionSlugs().catch(() => [])
  return slugs.map((slug) => ({ slug }))
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getRegion(slug).catch(() => null)
  if (!data) return {}

  const { region } = data
  const title = region.seo_title ?? buildTitle([`Restaurants vegan en ${region.name}`])
  const description = region.seo_description ?? truncate(
    `Découvrez les meilleurs restaurants vegan et végétariens en ${region.name}. Adresses, horaires et avis.`,
  )

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(`/region/${slug}`) },
  }
}

export default async function RegionPage({ params }: Props) {
  const { slug } = await params
  const data = await getRegion(slug).catch(() => null)
  if (!data) notFound()

  const { region, children, restaurants, total } = data

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-green-600">Accueil</Link>
        {' / '}
        <span className="text-gray-600">{region.name}</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Restaurants vegan &amp; végétariens en {region.name}
      </h1>
      <p className="text-gray-500 mb-8">{total} adresses</p>

      {/* Sub-regions / cities */}
      {children.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Par ville</h2>
          <div className="flex flex-wrap gap-2">
            {children.map((c) => (
              <Link
                key={c.slug}
                href={`/ville/${c.slug}`}
                className="bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* SEO text */}
      {region.seo_description && (
        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-gray-600 text-sm leading-relaxed">
          {region.seo_description}
        </div>
      )}

      {/* Restaurants grid */}
      {restaurants.length === 0 ? (
        <p className="text-gray-400">Aucun restaurant encore répertorié dans cette région.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} r={r} />
          ))}
        </div>
      )}

      {total > 50 && (
        <div className="mt-8 text-center">
          <Link
            href={`/restaurants?region_slug=${slug}`}
            className="text-green-600 hover:underline text-sm"
          >
            Voir les {total} restaurants →
          </Link>
        </div>
      )}
    </main>
  )
}
