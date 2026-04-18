import type { MetadataRoute } from 'next'
import { getRestaurantSlugs, getRegionSlugs } from '@/lib/api'
import { SITE_URL } from '@/lib/seo'

export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [restaurantSlugs, regionSlugs] = await Promise.all([
    getRestaurantSlugs().catch(() => [] as string[]),
    getRegionSlugs().catch(() => [] as string[]),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/restaurants`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/emploi`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/soumettre-un-restaurant`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  const restaurantPages: MetadataRoute.Sitemap = restaurantSlugs.map((slug) => ({
    url: `${SITE_URL}/restaurants/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const regionPages: MetadataRoute.Sitemap = regionSlugs.map((slug) => ({
    url: `${SITE_URL}/region/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticPages, ...restaurantPages, ...regionPages]
}
