const API_URL = process.env.API_URL ?? 'http://localhost:4000'

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? `API error ${res.status}`)
  }
  return res.json()
}

// ─── Restaurants ──────────────────────────────────────────────────────────────

export type RestaurantCard = {
  id: string; name: string; slug: string; short_description: string | null
  cover_image: string | null; city: string; price_range: number | null
  tags: string[]; cuisine_types: string[]; is_featured: boolean
  lat: number | null; lng: number | null
  region: { id: string; name: string; slug: string } | null
  reviews_count: { count: number }[]
}

export type RestaurantDetail = RestaurantCard & {
  description: string | null; address: string; zip_code: string
  phone: string | null; email: string | null; website: string | null
  social_links: Record<string, string> | null
  opening_hours: Record<string, { open: string; close: string } | null> | null
  images: string[]; menu_url: string | null
  seo_title: string | null; seo_description: string | null
  reviews: Array<{
    id: string; rating: number; title: string | null; content: string
    visit_date: string | null; created_at: string
    user: { id: string; name: string | null }
  }>
}

export type PaginatedRestaurants = {
  data: RestaurantCard[]; total: number; page: number; limit: number; hasNextPage: boolean
}

export function getRestaurants(params: Record<string, string | string[] | number | boolean | undefined> = {}, opts?: RequestInit) {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue
    if (Array.isArray(v)) v.forEach((item) => qs.append(k, String(item)))
    else qs.append(k, String(v))
  }
  return apiFetch<PaginatedRestaurants>(`/restaurants?${qs}`, { next: { revalidate: 3600 }, ...opts })
}

export function getRestaurant(slug: string, opts?: RequestInit) {
  return apiFetch<RestaurantDetail>(`/restaurants/${slug}`, { next: { revalidate: 3600 }, ...opts })
}

export function getFeaturedRestaurants(opts?: RequestInit) {
  return apiFetch<RestaurantCard[]>('/restaurants/featured', { next: { revalidate: 3600 }, ...opts })
}

export function getRestaurantSlugs() {
  return apiFetch<string[]>('/restaurants/slugs', { next: { revalidate: 86400 } })
}

// ─── Regions ─────────────────────────────────────────────────────────────────

export type Region = {
  id: string; name: string; slug: string; type: string
  parent_id: string | null; seo_title: string | null; seo_description: string | null
}

export type RegionDetail = {
  region: Region
  children: Array<{ id: string; name: string; slug: string; type: string }>
  restaurants: RestaurantCard[]
  total: number
}

export function getRegions(opts?: RequestInit) {
  return apiFetch<Region[]>('/regions', { next: { revalidate: 86400 }, ...opts })
}

export function getRegion(slug: string, opts?: RequestInit) {
  return apiFetch<RegionDetail>(`/regions/${slug}`, { next: { revalidate: 3600 }, ...opts })
}

export function getRegionSlugs() {
  return apiFetch<string[]>('/regions/slugs', { next: { revalidate: 86400 } })
}
