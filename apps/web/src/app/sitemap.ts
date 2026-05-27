import type { MetadataRoute } from 'next'
import { getRestaurantPathSlugs, getRegionSlugs, getTagCoverage, getBlogSlugs, getCities } from '@/lib/api'
import { SITE_URL, restaurantUrl } from '@/lib/seo'
import { TAGS } from '@/lib/tags'

export const revalidate = 86400

// Top cities get a boost in priority
const TOP_CITY_SLUGS = new Set(['paris', 'lyon', 'marseille', 'bordeaux', 'nantes', 'toulouse', 'lille', 'nice', 'strasbourg', 'montpellier'])

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pathSlugs, regionSlugs, coverage, blogSlugs, cities] = await Promise.all([
    getRestaurantPathSlugs().catch(() => []),
    getRegionSlugs().catch(() => [] as string[]),
    getTagCoverage().catch(() => []),
    getBlogSlugs().catch(() => [] as string[]),
    getCities().catch(() => []),
  ])

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,                                    changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE_URL}/restaurants`,                   changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE_URL}/villes`,                        changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${SITE_URL}/blog`,                          changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/emploi`,                        changeFrequency: 'daily',   priority: 0.6 },
    { url: `${SITE_URL}/soumettre-un-restaurant`,       changeFrequency: 'monthly', priority: 0.5 },
  ]

  // ── Tag index pages (/restaurants/vegan, /restaurants/bio…) ──────────────
  const tagPages: MetadataRoute.Sitemap = TAGS.map((t) => ({
    url: `${SITE_URL}/restaurants/${t.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  // ── Restaurant detail pages ───────────────────────────────────────────────
  const restaurantPages: MetadataRoute.Sitemap = pathSlugs.map((r) => ({
    url: `${SITE_URL}${restaurantUrl(r)}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // ── City pages (/ville/paris, /ville/lyon…) ───────────────────────────────
  // Only include cities that have restaurants; top cities get priority 0.8
  const citySet = new Set(cities.filter((c) => c.total_restaurants > 0).map((c) => c.slug))

  const regionPages: MetadataRoute.Sitemap = regionSlugs.map((slug) => ({
    url: `${SITE_URL}/ville/${slug}`,
    changeFrequency: 'weekly' as const,
    priority: TOP_CITY_SLUGS.has(slug) ? 0.8 : citySet.has(slug) ? 0.65 : 0.5,
  }))

  // ── Region pages (/region/ile-de-france…) ────────────────────────────────
  const regionDetailPages: MetadataRoute.Sitemap = regionSlugs.map((slug) => ({
    url: `${SITE_URL}/region/${slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // ── Blog posts (/blog/mon-article) ───────────────────────────────────────
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.65,
  }))

  // ── City × tag pages (/ville/paris/vegan…) ───────────────────────────────
  const cityTagPages: MetadataRoute.Sitemap = coverage.flatMap((c) => {
    const tagConfig = TAGS.find((t) => t.dbValue === c.tag)
    if (!tagConfig) return []
    return [{
      url: `${SITE_URL}/ville/${c.regionSlug}/${tagConfig.slug}`,
      changeFrequency: 'weekly' as const,
      priority: TOP_CITY_SLUGS.has(c.regionSlug) ? 0.8 : 0.65,
    }]
  })

  return [
    ...staticPages,
    ...tagPages,
    ...cityTagPages,
    ...restaurantPages,
    ...regionPages,
    ...regionDetailPages,
    ...blogPages,
  ]
}
