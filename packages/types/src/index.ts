// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = 'user' | 'owner' | 'admin'
export type RestaurantStatus = 'active' | 'pending' | 'rejected'
export type ClaimStatus = 'pending' | 'approved' | 'rejected'
export type ReviewStatus = 'pending' | 'approved' | 'rejected'
export type JobType = 'offer' | 'cv'
export type RegionType = 'region' | 'department' | 'city' | 'arrondissement'
export type MessageType = 'modification_request' | 'general' | 'claim_message'
export type SubscriptionPlan = 'starter' | 'pro'
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due'
export type PageEventType = 'view' | 'click_website' | 'click_phone' | 'click_directions' | 'click_map'

// ─── Core Models ──────────────────────────────────────────────────────────────

export interface User {
  id: string
  clerk_id: string
  email: string
  name: string | null
  role: UserRole
  created_at: string
}

export interface Region {
  id: string
  name: string
  slug: string
  type: RegionType
  parent_id: string | null
  seo_title: string | null
  seo_description: string | null
  lat: number | null
  lng: number | null
  created_at: string
}

export interface OpeningHours {
  lundi?: { open: string; close: string } | null
  mardi?: { open: string; close: string } | null
  mercredi?: { open: string; close: string } | null
  jeudi?: { open: string; close: string } | null
  vendredi?: { open: string; close: string } | null
  samedi?: { open: string; close: string } | null
  dimanche?: { open: string; close: string } | null
}

export interface SocialLinks {
  instagram?: string
  facebook?: string
  twitter?: string
  tiktok?: string
  linkedin?: string
}

export interface Restaurant {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  address: string
  zip_code: string
  city: string
  region_id: string | null
  lat: number | null
  lng: number | null
  phone: string | null
  email: string | null
  website: string | null
  social_links: SocialLinks | null
  opening_hours: OpeningHours | null
  price_range: 1 | 2 | 3 | 4 | null
  tags: string[]
  cuisine_types: string[]
  images: string[]
  cover_image: string | null
  menu_url: string | null
  status: RestaurantStatus
  is_featured: boolean
  featured_until: string | null
  featured_region_id: string | null
  owner_id: string | null
  claimed_at: string | null
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
  // Relations (joined)
  region?: Region
  owner?: User
  reviews_aggregate?: { count: number; avg_rating: number }
}

export interface Claim {
  id: string
  restaurant_id: string
  user_id: string
  status: ClaimStatus
  message: string | null
  admin_note: string | null
  reviewed_by: string | null
  created_at: string
  reviewed_at: string | null
  // Relations
  restaurant?: Restaurant
  user?: User
}

export interface Review {
  id: string
  restaurant_id: string
  user_id: string
  rating: 1 | 2 | 3 | 4 | 5
  title: string | null
  content: string
  status: ReviewStatus
  moderated_by: string | null
  visit_date: string | null
  created_at: string
  // Relations
  user?: Pick<User, 'id' | 'name'>
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  cover_image: string | null
  author_id: string
  published_at: string | null
  seo_title: string | null
  seo_description: string | null
  tags: string[]
  created_at: string
  // Relations
  author?: Pick<User, 'id' | 'name'>
}

export interface RestaurantSubmission {
  id: string
  submitted_by: string | null
  data: Record<string, unknown>
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by: string | null
  created_at: string
}

export interface Job {
  id: string
  type: JobType
  title: string
  description: string
  restaurant_id: string | null
  user_id: string
  location: string | null
  contract_type: string | null
  status: 'active' | 'closed'
  expires_at: string | null
  created_at: string
  // Relations
  restaurant?: Pick<Restaurant, 'id' | 'name' | 'slug' | 'cover_image'>
  user?: Pick<User, 'id' | 'name'>
}

export interface PageEvent {
  id: string
  restaurant_id: string
  event_type: PageEventType
  session_id: string | null
  referrer: string | null
  user_agent: string | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  restaurant_id: string
  paddle_subscription_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  current_period_end: string | null
  created_at: string
}

export interface FeaturedPurchase {
  id: string
  restaurant_id: string
  paddle_transaction_id: string
  region_id: string | null
  starts_at: string
  ends_at: string
  created_at: string
}

export interface Message {
  id: string
  from_user_id: string
  restaurant_id: string | null
  type: MessageType
  content: string
  status: 'unread' | 'read'
  created_at: string
  // Relations
  from_user?: Pick<User, 'id' | 'name' | 'email'>
  restaurant?: Pick<Restaurant, 'id' | 'name' | 'slug'>
}

// ─── API Types ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNextPage: boolean
}

export interface ApiError {
  statusCode: number
  message: string
  error?: string
}

// ─── Restaurant Filters ───────────────────────────────────────────────────────

export interface RestaurantFilters {
  city?: string
  region_slug?: string
  tags?: string[]
  cuisine_types?: string[]
  price_range?: number[]
  search?: string
  is_featured?: boolean
  page?: number
  limit?: number
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface RestaurantAnalytics {
  restaurant_id: string
  period: '7d' | '30d' | '90d' | '1y'
  total_views: number
  unique_sessions: number
  clicks_website: number
  clicks_phone: number
  clicks_directions: number
  top_referrers: { referrer: string; count: number }[]
  daily_views: { date: string; views: number }[]
}
