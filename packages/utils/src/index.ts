// ─── Slug utils ───────────────────────────────────────────────────────────────

/**
 * Generate a URL-safe French slug
 * "Le Potager du Marais" → "le-potager-du-marais"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^\w\s-]/g, '')        // remove special chars
    .replace(/[\s_]+/g, '-')         // spaces → hyphens
    .replace(/^-+|-+$/g, '')         // trim hyphens
}

/**
 * Generate unique restaurant slug: "le-potager-du-marais-paris"
 */
export function restaurantSlug(name: string, city: string): string {
  return `${slugify(name)}-${slugify(city)}`
}

// ─── SEO utils ────────────────────────────────────────────────────────────────

export function buildSeoTitle(parts: string[], siteName = 'France Veg'): string {
  return [...parts, siteName].join(' | ')
}

export function truncateDescription(text: string, maxLength = 160): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3).trimEnd() + '...'
}

// ─── Price range ──────────────────────────────────────────────────────────────

export function priceRangeLabel(range: 1 | 2 | 3 | 4 | null): string {
  if (!range) return ''
  return '€'.repeat(range)
}

// ─── Date utils ───────────────────────────────────────────────────────────────

export function formatDate(dateStr: string, locale = 'fr-FR'): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ─── Address ──────────────────────────────────────────────────────────────────

export function formatAddress(address: string, zipCode: string, city: string): string {
  return `${address}, ${zipCode} ${city}`
}
