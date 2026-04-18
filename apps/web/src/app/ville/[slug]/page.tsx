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
  const title = region.seo_title ?? buildTitle([`Restaurants vegan à ${region.name}`])
  const description = region.seo_description ?? truncate(
    `Les meilleurs restaurants vegan et végétariens à ${region.name}. Fiches complètes avec horaires, adresse et avis.`,
  )

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(`/ville/${slug}`) },
  }
}

export default async function VillePage({ params }: Props) {
  const { slug } = await params
  const data = await getRegion(slug).catch(() => null)
  if (!data) notFound()

  const { region, children, restaurants, total } = data

  // Paris specific: show arrondissements
  const isParisCity = slug === 'paris'
  const arrondissements = isParisCity ? children.filter((c) => c.type === 'arrondissement') : []
  const otherChildren = children.filter((c) => c.type !== 'arrondissement')

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-green-600">Accueil</Link>
        {' / '}
        {region.parent_id && (
          <>
            <Link href={`/region/${slug}`} className="hover:text-green-600">Région</Link>
            {' / '}
          </>
        )}
        <span className="text-gray-600">{region.name}</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Restaurants vegan &amp; végétariens à {region.name}
      </h1>
      <p className="text-gray-500 mb-8">{total} adresses</p>

      {/* Paris: arrondissements */}
      {arrondissements.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Par arrondissement</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {arrondissements.map((arr) => (
              <Link
                key={arr.slug}
                href={`/ville/paris/${arr.slug}`}
                className="bg-green-50 text-green-700 hover:bg-green-100 px-3 py-2 rounded-lg text-sm text-center font-medium transition-colors"
              >
                {arr.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {otherChildren.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {otherChildren.map((c) => (
            <Link
              key={c.slug}
              href={`/ville/${c.slug}`}
              className="bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700 px-3 py-1.5 rounded-full text-sm transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {region.seo_description && (
        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-gray-600 text-sm leading-relaxed">
          {region.seo_description}
        </div>
      )}

      {restaurants.length === 0 ? (
        <p className="text-gray-400">Aucun restaurant encore répertorié dans cette ville.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} r={r} />
          ))}
        </div>
      )}

      {total > 50 && (
        <div className="mt-8 text-center">
          <Link href={`/restaurants?city=${region.name}`} className="text-green-600 hover:underline text-sm">
            Voir tous les {total} restaurants à {region.name} →
          </Link>
        </div>
      )}
    </main>
  )
}
