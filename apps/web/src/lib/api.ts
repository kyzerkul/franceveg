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
  region: { id: string; name: string; slug: string; type: string } | null
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

export function getRestaurant(slug: string, regionSlug?: string, opts?: RequestInit) {
  const qs = regionSlug ? `?region=${encodeURIComponent(regionSlug)}` : ''
  return apiFetch<RestaurantDetail>(`/restaurants/${slug}${qs}`, { next: { revalidate: 3600 }, ...opts })
}

export function getFeaturedRestaurants(opts?: RequestInit) {
  return apiFetch<RestaurantCard[]>('/restaurants/featured', { next: { revalidate: 3600 }, ...opts })
}

export function getRestaurantSlugs() {
  return apiFetch<string[]>('/restaurants/slugs', { next: { revalidate: 86400 } })
}

export type RestaurantPathSlug = {
  slug: string
  city: string
  region: { slug: string; type: string } | null
}

export function getRestaurantPathSlugs() {
  return apiFetch<RestaurantPathSlug[]>('/restaurants/path-slugs', { next: { revalidate: 86400 } })
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

export type CityItem = {
  id: string; name: string; slug: string; type: string
  total_restaurants: number
}

export function getCities(opts?: RequestInit) {
  return apiFetch<CityItem[]>('/regions/cities', { next: { revalidate: 86400 }, ...opts })
}

// ─── Tag coverage ─────────────────────────────────────────────────────────────

export type TagCoverageItem = { regionSlug: string; tag: string }

export function getTagCoverage(opts?: RequestInit) {
  return apiFetch<TagCoverageItem[]>('/restaurants/tag-coverage', { next: { revalidate: 86400 }, ...opts })
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export type BlogPostCard = {
  id: string; title: string; slug: string; excerpt: string | null
  cover_image: string | null; published_at: string; tags: string[]
  author: { id: string; name: string | null }
}

export type BlogPostDetail = BlogPostCard & {
  content: string; seo_title: string | null; seo_description: string | null
}

export type PaginatedBlog = {
  data: BlogPostCard[]; total: number; page: number; limit: number; hasNextPage: boolean
}

export function getBlogPosts(params: Record<string, string | number | undefined> = {}, opts?: RequestInit) {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) qs.append(k, String(v))
  }
  return apiFetch<PaginatedBlog>(`/blog?${qs}`, { next: { revalidate: 3600 }, ...opts })
}

export function getBlogPost(slug: string, opts?: RequestInit) {
  return apiFetch<BlogPostDetail>(`/blog/${slug}`, { next: { revalidate: 3600 }, ...opts })
}

export function getBlogSlugs() {
  return apiFetch<string[]>('/blog/slugs', { next: { revalidate: 86400 } })
}

// ─── Emploi ───────────────────────────────────────────────────────────────────

export type JobCard = {
  id: string; type: 'offer' | 'cv'; title: string; description: string
  location: string | null; contract_type: string | null
  expires_at: string | null; created_at: string
  restaurant: { id: string; name: string; slug: string; city: string; cover_image: string | null } | null
}

export type JobDetail = JobCard & {
  user: { id: string; name: string | null }
}

export type PaginatedJobs = {
  data: JobCard[]; total: number; page: number; limit: number; hasNextPage: boolean
}

export function getJobs(params: Record<string, string | number | undefined> = {}, opts?: RequestInit) {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) qs.append(k, String(v))
  }
  return apiFetch<PaginatedJobs>(`/jobs?${qs}`, { next: { revalidate: 1800 }, ...opts })
}

export function getJob(id: string, opts?: RequestInit) {
  return apiFetch<JobDetail>(`/jobs/${id}`, { next: { revalidate: 1800 }, ...opts })
}
