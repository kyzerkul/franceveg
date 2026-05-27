import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getRestaurant, getRestaurantPathSlugs } from '@/lib/api'
import { buildTitle, truncate, canonicalUrl, restaurantUrl } from '@/lib/seo'
import { RestaurantDetail } from '@/components/restaurants/RestaurantDetail'

type Props = { params: Promise<{ arr: string; slug: string }> }

export async function generateStaticParams() {
  const pathSlugs = await getRestaurantPathSlugs().catch(() => [])
  return pathSlugs
    .filter((r) => r.region?.type === 'arrondissement' && r.region.slug.startsWith('paris-'))
    .map((r) => ({ arr: r.region!.slug.replace(/^paris-/, ''), slug: r.slug }))
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { arr, slug } = await params
  const regionSlug = `paris-${arr}`
  const r = await getRestaurant(slug, regionSlug).catch(() => null)
  if (!r) return {}

  const url = restaurantUrl(r)
  const title = r.seo_title ?? buildTitle([r.name, r.city])
  const description = r.seo_description ?? truncate(
    `${r.name} — restaurant ${r.tags.join(', ')} à ${r.city}. ${r.short_description ?? ''}`,
  )

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
  const { arr, slug } = await params
  const r = await getRestaurant(slug, `paris-${arr}`).catch(() => null)
  if (!r) notFound()

  return <RestaurantDetail r={r} />
}
