const SITE_NAME = 'France Veg'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://francevegetarienne.com'

export { SITE_URL, SITE_NAME }

export function buildTitle(parts: string[]): string {
  return [...parts, SITE_NAME].join(' | ')
}

export function truncate(text: string, max = 160): string {
  if (!text || text.length <= max) return text
  return text.slice(0, max - 3).trimEnd() + '...'
}

export function canonicalUrl(path: string): string {
  return `${SITE_URL}${path}`
}

// ─── Restaurant URL helper ───────────────────────────────────────────────────
// Construit l'URL d'un restaurant en fonction de sa région :
//   - Paris avec arrondissement → /restaurants/paris/9e/[slug]
//   - Autre ville              → /restaurants/[ville]/[slug]

function slugifyText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export type RestaurantLinkData = {
  slug: string
  city: string
  region?: { slug: string; type: string } | null
}

export function restaurantUrl(r: RestaurantLinkData): string {
  if (r.region?.type === 'arrondissement' && r.region.slug.startsWith('paris-')) {
    const arrSlug = r.region.slug.replace(/^paris-/, '')
    return `/restaurants/paris/${arrSlug}/${r.slug}`
  }
  const citySlug = r.region?.slug ?? slugifyText(r.city)
  return `/restaurants/${citySlug}/${r.slug}`
}

/**
 * Parse une URL de restaurant pour récupérer le slug de région et de restaurant.
 *   ['lyon', 'le-shanti']      → { regionSlug: 'lyon', slug: 'le-shanti' }
 *   ['paris', '9e', 'cantine'] → { regionSlug: 'paris-9e', slug: 'cantine' }
 */
export function parseRestaurantPath(path: string[]): { regionSlug: string; slug: string } | null {
  if (path.length === 2) {
    return { regionSlug: path[0], slug: path[1] }
  }
  if (path.length === 3 && path[0] === 'paris') {
    return { regionSlug: `paris-${path[1]}`, slug: path[2] }
  }
  return null
}

// ─── Restaurant meta description ─────────────────────────────────────────────

export function buildRestaurantDescription(r: {
  name: string
  city: string
  tags: string[]
  cuisine_types: string[]
  short_description: string | null
  seo_description: string | null
}): string {
  if (r.seo_description?.trim()) return truncate(r.seo_description)

  if (r.short_description?.trim()) {
    return truncate(
      `${r.name} — ${r.short_description.trim()} Retrouvez ce restaurant à ${r.city} sur France Veg.`,
    )
  }

  const descriptors = [...r.tags.slice(0, 3), ...r.cuisine_types.slice(0, 2)]
    .map((t) => t.toLowerCase())
    .filter(Boolean)

  if (descriptors.length > 0) {
    return truncate(
      `${r.name} — restaurant ${descriptors.join(', ')} à ${r.city}. Horaires, avis et infos pratiques sur France Veg.`,
    )
  }

  return truncate(
    `Découvrez ${r.name}, restaurant vegan et végétarien à ${r.city}. Retrouvez horaires, avis et infos pratiques sur France Veg.`,
  )
}

// ─── JSON-LD ─────────────────────────────────────────────────────────────────

type OpeningHours = Record<string, { open: string; close: string } | null>

const DAY_MAP: Record<string, string> = {
  lundi: 'Monday', mardi: 'Tuesday', mercredi: 'Wednesday',
  jeudi: 'Thursday', vendredi: 'Friday', samedi: 'Saturday', dimanche: 'Sunday',
}

export function restaurantJsonLd(r: {
  name: string; description: string | null; address: string
  zip_code: string; city: string; phone: string | null; website: string | null
  price_range: number | null; cuisine_types: string[]; opening_hours: OpeningHours | null
  cover_image: string | null; slug: string
  reviews?: Array<{ rating: number }>
}) {
  const avgRating = r.reviews?.length
    ? r.reviews.reduce((s, rv) => s + rv.rating, 0) / r.reviews.length
    : undefined

  const hours = r.opening_hours
    ? Object.entries(r.opening_hours)
        .filter(([, v]) => v)
        .map(([day, v]) => `${DAY_MAP[day] ?? day} ${v!.open}-${v!.close}`)
    : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: r.name,
    description: r.description ?? undefined,
    url: canonicalUrl(`/restaurants/${r.slug}`),
    telephone: r.phone ?? undefined,
    sameAs: r.website ? [r.website] : undefined,
    servesCuisine: r.cuisine_types,
    priceRange: r.price_range ? '€'.repeat(r.price_range) : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: r.address,
      postalCode: r.zip_code,
      addressLocality: r.city,
      addressCountry: 'FR',
    },
    image: r.cover_image ? [r.cover_image] : undefined,
    openingHours: hours,
    aggregateRating: avgRating
      ? {
          '@type': 'AggregateRating',
          ratingValue: avgRating.toFixed(1),
          reviewCount: r.reviews!.length,
          bestRating: '5',
          worstRating: '1',
        }
      : undefined,
  }
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
