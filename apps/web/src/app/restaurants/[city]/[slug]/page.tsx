import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getRestaurant, getRestaurantPathSlugs } from '@/lib/api'
import { buildTitle, buildRestaurantDescription, canonicalUrl, restaurantUrl } from '@/lib/seo'
import { buildFaqItems, buildFaqJsonLd } from '@/lib/faq'
import { RestaurantDetail } from '@/components/restaurants/RestaurantDetail'

type Props = { params: Promise<{ city: string; slug: string }> }

export async function generateStaticParams() {
  const pathSlugs = await getRestaurantPathSlugs().catch(() => [])
  return pathSlugs
    .filter((r) => r.region !== null && !(r.region.type === 'arrondissement' && r.region.slug.startsWith('paris-')))
    .map((r) => ({ city: r.region!.slug, slug: r.slug }))
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, slug } = await params
  const r = await getRestaurant(slug, city).catch(() => null)
  if (!r) return {}

  const url = restaurantUrl(r)
  const title = r.seo_title ?? buildTitle([r.name, r.city])
  const description = buildRestaurantDescription(r)

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(url) },
    openGraph: {
      title,
      description,
      url: canonicalUrl(url),
      images: r.cover_image ? [{ url: r.cover_image, alt: r.name }] : [],
    },
  }
}

export default async function RestaurantPage({ params }: Props) {
  const { city, slug } = await params
  const r = await getRestaurant(slug, city).catch(() => null)
  if (!r) notFound()

  const faqItems = buildFaqItems(r.tags, r.name, 5)
  const faqJsonLd = faqItems.length > 0 ? buildFaqJsonLd(faqItems) : null

  return (
    <>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <RestaurantDetail r={r} />
    </>
  )
}
