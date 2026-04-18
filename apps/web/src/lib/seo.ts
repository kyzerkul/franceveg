const SITE_NAME = 'France Veg'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://franceveg.fr'

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
