import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { CreateBlogPostDto } from './dto/create-blog-post.dto'
import { UpdateBlogPostDto } from './dto/update-blog-post.dto'

@Injectable()
export class AdminService {
  constructor(private supabase: SupabaseService) {}

  async getStats() {
    const [total, pending, claims, reviews, users] = await Promise.all([
      this.supabase.client.from('restaurants').select('*', { count: 'exact', head: true }),
      this.supabase.client.from('restaurants').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      this.supabase.client.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      this.supabase.client.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      this.supabase.client.from('users').select('*', { count: 'exact', head: true }),
    ])
    return {
      restaurants: { total: total.count ?? 0, pending: pending.count ?? 0 },
      claims: { pending: claims.count ?? 0 },
      reviews: { pending: reviews.count ?? 0 },
      users: { total: users.count ?? 0 },
    }
  }

  async getRestaurants(page = 1, limit = 20, status?: string) {
    const offset = (page - 1) * limit
    let q = this.supabase.client
      .from('restaurants')
      .select(
        'id, name, slug, city, status, created_at, region:regions!region_id(name), owner:users!owner_id(name)',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (status) q = q.eq('status', status)
    const { data, count, error } = await q
    if (error) throw new Error(error.message)
    return { data: data ?? [], total: count ?? 0, page, limit, hasNextPage: offset + limit < (count ?? 0) }
  }

  async updateRestaurant(id: string, body: { status?: string; is_featured?: boolean }) {
    const { error } = await this.supabase.client.from('restaurants').update(body).eq('id', id)
    if (error) throw new Error(error.message)
    return { success: true }
  }

  async getClaims(page = 1, limit = 20, status = 'pending') {
    const offset = (page - 1) * limit
    const { data, count, error } = await this.supabase.client
      .from('claims')
      .select(
        'id, status, message, created_at, restaurant:restaurants!restaurant_id(id, name, city, slug), user:users!user_id(id, name)',
        { count: 'exact' },
      )
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) throw new Error(error.message)
    return { data: data ?? [], total: count ?? 0, page, limit, hasNextPage: offset + limit < (count ?? 0) }
  }

  async updateClaim(id: string, action: 'approved' | 'rejected') {
    const { data: claim, error } = await this.supabase.client
      .from('claims').select('restaurant_id, user_id').eq('id', id).single()
    if (error || !claim) throw new NotFoundException('Claim introuvable')

    await this.supabase.client.from('claims').update({ status: action }).eq('id', id)

    if (action === 'approved') {
      await this.supabase.client
        .from('restaurants')
        .update({ owner_id: claim.user_id, status: 'active' })
        .eq('id', claim.restaurant_id)
    }
    return { success: true }
  }

  async getReviews(page = 1, limit = 20, status = 'pending') {
    const offset = (page - 1) * limit
    const { data, count, error } = await this.supabase.client
      .from('reviews')
      .select(
        'id, rating, title, content, status, created_at, restaurant:restaurants!restaurant_id(id, name, slug), user:users!user_id(id, name)',
        { count: 'exact' },
      )
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) throw new Error(error.message)
    return { data: data ?? [], total: count ?? 0, page, limit, hasNextPage: offset + limit < (count ?? 0) }
  }

  async updateReview(id: string, status: 'approved' | 'rejected') {
    const { error } = await this.supabase.client.from('reviews').update({ status }).eq('id', id)
    if (error) throw new Error(error.message)
    return { success: true }
  }

  async getUsers(page = 1, limit = 20) {
    const offset = (page - 1) * limit
    const { data, count, error } = await this.supabase.client
      .from('users')
      .select('id, name, email, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) throw new Error(error.message)
    return { data: data ?? [], total: count ?? 0, page, limit, hasNextPage: offset + limit < (count ?? 0) }
  }

  // ─── Blog admin ────────────────────────────────────────────────────────────

  async getBlogPosts(page = 1, limit = 20) {
    const offset = (page - 1) * limit
    const { data, count, error } = await this.supabase.client
      .from('blog_posts')
      .select(
        'id, title, slug, excerpt, cover_image, published_at, tags, created_at, author:users!author_id(id, name)',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) throw new Error(error.message)
    return { data: data ?? [], total: count ?? 0, page, limit, hasNextPage: offset + limit < (count ?? 0) }
  }

  async getBlogPost(id: string) {
    const { data, error } = await this.supabase.client
      .from('blog_posts')
      .select('*, author:users!author_id(id, name)')
      .eq('id', id)
      .single()
    if (error || !data) throw new NotFoundException(`Article "${id}" introuvable`)
    return data
  }

  async createBlogPost(dto: CreateBlogPostDto, clerkUserId: string) {
    const { data: user } = await this.supabase.client
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single()
    if (!user) throw new Error('Utilisateur admin introuvable dans la table users (webhook Clerk configuré ?)')

    const publishedAt = dto.published ? new Date().toISOString() : null
    const { data, error } = await this.supabase.client
      .from('blog_posts')
      .insert({
        title: dto.title,
        slug: dto.slug,
        content: dto.content,
        excerpt: dto.excerpt ?? null,
        cover_image: dto.cover_image ?? null,
        tags: dto.tags ?? [],
        seo_title: dto.seo_title ?? null,
        seo_description: dto.seo_description ?? null,
        published_at: publishedAt,
        author_id: user.id,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  }

  async updateBlogPost(id: string, dto: UpdateBlogPostDto) {
    const updates: Record<string, unknown> = {}
    if (dto.title !== undefined) updates.title = dto.title
    if (dto.slug !== undefined) updates.slug = dto.slug
    if (dto.content !== undefined) updates.content = dto.content
    if (dto.excerpt !== undefined) updates.excerpt = dto.excerpt
    if (dto.cover_image !== undefined) updates.cover_image = dto.cover_image
    if (dto.tags !== undefined) updates.tags = dto.tags
    if (dto.seo_title !== undefined) updates.seo_title = dto.seo_title
    if (dto.seo_description !== undefined) updates.seo_description = dto.seo_description

    const { data, error } = await this.supabase.client
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  }

  async deleteBlogPost(id: string) {
    const { error } = await this.supabase.client.from('blog_posts').delete().eq('id', id)
    if (error) throw new Error(error.message)
    return { success: true }
  }

  async toggleBlogPostPublish(id: string) {
    const { data: post } = await this.supabase.client
      .from('blog_posts').select('published_at').eq('id', id).single()
    if (!post) throw new NotFoundException(`Article "${id}" introuvable`)

    const newPublishedAt = post.published_at ? null : new Date().toISOString()
    const { data, error } = await this.supabase.client
      .from('blog_posts')
      .update({ published_at: newPublishedAt })
      .eq('id', id)
      .select('id, title, slug, published_at')
      .single()
    if (error) throw new Error(error.message)
    return data
  }
}
