import { auth } from '@clerk/nextjs/server'

const API_URL = process.env.API_URL ?? 'http://localhost:4000'

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const { getToken } = await auth()
  const token = await getToken()

  const res = await fetch(`${API_URL}/api/admin${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? `Admin API error ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export type AdminStats = {
  restaurants: { total: number; pending: number }
  claims: { pending: number }
  reviews: { pending: number }
  users: { total: number }
}

export function getStats() {
  return adminFetch<AdminStats>('/stats')
}

// ─── Restaurants ─────────────────────────────────────────────────────────────

export type AdminRestaurant = {
  id: string; name: string; slug: string; city: string; status: string; created_at: string
  region: { name: string } | null
  owner: { name: string | null } | null
}

export function getAdminRestaurants(params?: { page?: number; status?: string }) {
  const qs = new URLSearchParams()
  if (params?.page) qs.set('page', String(params.page))
  if (params?.status) qs.set('status', params.status)
  return adminFetch<{ data: AdminRestaurant[]; total: number; hasNextPage: boolean }>(`/restaurants?${qs}`)
}

export function updateRestaurant(id: string, body: { status?: string; is_featured?: boolean }) {
  return adminFetch(`/restaurants/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
}

// ─── Claims ──────────────────────────────────────────────────────────────────

export type AdminClaim = {
  id: string; status: string; message: string | null; created_at: string
  restaurant: { id: string; name: string; city: string; slug: string } | null
  user: { id: string; name: string | null } | null
}

export function getClaims(params?: { page?: number; status?: string }) {
  const qs = new URLSearchParams()
  if (params?.page) qs.set('page', String(params.page))
  if (params?.status) qs.set('status', params.status ?? 'pending')
  return adminFetch<{ data: AdminClaim[]; total: number; hasNextPage: boolean }>(`/claims?${qs}`)
}

export function updateClaim(id: string, action: 'approved' | 'rejected') {
  return adminFetch(`/claims/${id}`, { method: 'PATCH', body: JSON.stringify({ action }) })
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export type AdminReview = {
  id: string; rating: number; title: string | null; content: string; status: string; created_at: string
  restaurant: { id: string; name: string; slug: string } | null
  user: { id: string; name: string | null } | null
}

export function getReviews(params?: { page?: number; status?: string }) {
  const qs = new URLSearchParams()
  if (params?.page) qs.set('page', String(params.page))
  if (params?.status) qs.set('status', params.status ?? 'pending')
  return adminFetch<{ data: AdminReview[]; total: number; hasNextPage: boolean }>(`/reviews?${qs}`)
}

export function updateReview(id: string, status: 'approved' | 'rejected') {
  return adminFetch(`/reviews/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
}

// ─── Users ───────────────────────────────────────────────────────────────────

export type AdminUser = {
  id: string; name: string | null; email: string | null; created_at: string
}

export function getUsers(params?: { page?: number }) {
  const qs = new URLSearchParams()
  if (params?.page) qs.set('page', String(params.page))
  return adminFetch<{ data: AdminUser[]; total: number; hasNextPage: boolean }>(`/users?${qs}`)
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export type AdminBlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  published_at: string | null
  tags: string[]
  created_at: string
  author: { id: string; name: string | null } | null
}

export type AdminBlogPostDetail = AdminBlogPost & {
  content: string
  seo_title: string | null
  seo_description: string | null
}

export function getAdminBlogPosts(params?: { page?: number }) {
  const qs = new URLSearchParams()
  if (params?.page) qs.set('page', String(params.page))
  return adminFetch<{ data: AdminBlogPost[]; total: number; hasNextPage: boolean }>(`/blog?${qs}`)
}

export function getAdminBlogPost(id: string) {
  return adminFetch<AdminBlogPostDetail>(`/blog/${id}`)
}

export function createBlogPost(body: Record<string, unknown>) {
  return adminFetch<AdminBlogPostDetail>('/blog', { method: 'POST', body: JSON.stringify(body) })
}

export function updateBlogPost(id: string, body: Record<string, unknown>) {
  return adminFetch<AdminBlogPostDetail>(`/blog/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
}

export function deleteBlogPost(id: string) {
  return adminFetch(`/blog/${id}`, { method: 'DELETE' })
}

export function toggleBlogPostPublish(id: string) {
  return adminFetch(`/blog/${id}/publish`, { method: 'POST' })
}
