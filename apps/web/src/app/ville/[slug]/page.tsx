import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getRegion, getRegionSlugs } from '@/lib/api'
import { buildTitle, truncate, canonicalUrl } from '@/lib/seo'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { VilleCityContent } from '@/components/ui/VilleCityContent'

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

  return (
    <>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <Breadcrumb
            light
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Villes', href: '/villes' },
              { label: region.name },
            ]}
          />
          <h1
            className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Restaurants vegan à {region.name}
          </h1>
          <p className="text-green-100 text-sm">
            {total} adresse{total > 1 ? 's' : ''} · Avis certifiés · Fiches complètes
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <VilleCityContent
          region={region}
          children={children}
          restaurants={restaurants}
          total={total}
          slug={slug}
        />
      </div>
    </>
  )
}
