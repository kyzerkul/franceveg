import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getRegion, getRegionSlugs } from '@/lib/api'
import { RestaurantCard } from '@/components/ui/RestaurantCard'
import { buildTitle, truncate, canonicalUrl } from '@/lib/seo'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

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
    <>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <Breadcrumb
            light
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Restaurants', href: '/restaurants' },
              { label: region.name },
            ]}
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Restaurants vegan en {region.name}
          </h1>
          <p className="text-green-100 text-sm">
            {total} adresses · Avis certifiés · Fiches complètes
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Cities */}
        {children.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Par ville
            </h2>
            <div className="flex flex-wrap gap-2">
              {children.map((c) => (
                <Link
                  key={c.slug}
                  href={`/ville/${c.slug}`}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  style={{ background: '#F0FDF4', color: '#2D6A4F', border: '1px solid #B7E4C7' }}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* SEO text */}
        {region.seo_description && (
          <div className="rounded-2xl p-6 mb-8 text-gray-600 text-sm leading-relaxed" style={{ background: '#FDF6EC' }}>
            {region.seo_description}
          </div>
        )}

        {/* Grid */}
        {restaurants.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🌿</div>
            <p className="text-gray-400">Aucun restaurant encore répertorié dans cette région.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((r) => (
              <RestaurantCard key={r.id} r={r} />
            ))}
          </div>
        )}

        {total > 50 && (
          <div className="mt-8 text-center">
            <Link href={`/restaurants?region_slug=${slug}`} className="text-sm font-medium text-green-600 hover:text-green-700">
              Voir les {total} restaurants →
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
