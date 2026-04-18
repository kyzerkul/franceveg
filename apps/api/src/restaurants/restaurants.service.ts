import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { QueryRestaurantsDto } from './dto/query-restaurants.dto'

@Injectable()
export class RestaurantsService {
  constructor(private supabase: SupabaseService) {}

  async findAll(query: QueryRestaurantsDto) {
    const { page = 1, limit = 20, search, city, region_slug, tags, cuisine_types, price_range, is_featured } = query
    const offset = (page - 1) * limit

    let q = this.supabase.client
      .from('restaurants')
      .select(`
        id, name, slug, short_description, address, city, zip_code,
        cover_image, price_range, tags, cuisine_types, is_featured,
        lat, lng, status,
        region:regions!region_id(id, name, slug),
        reviews_count:reviews(count)
      `, { count: 'exact' })
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      q = q.textSearch('name', search, { type: 'websearch', config: 'french' })
    }
    if (city) {
      q = q.ilike('city', `%${city}%`)
    }
    if (is_featured !== undefined) {
      q = q.eq('is_featured', is_featured)
    }
    if (tags?.length) {
      q = q.overlaps('tags', tags)
    }
    if (cuisine_types?.length) {
      q = q.overlaps('cuisine_types', cuisine_types)
    }
    if (price_range?.length) {
      q = q.in('price_range', price_range)
    }
    if (region_slug) {
      const { data: region } = await this.supabase.client
        .from('regions')
        .select('id')
        .eq('slug', region_slug)
        .single()
      if (region) q = q.eq('region_id', region.id)
    }

    const { data, count, error } = await q
    if (error) throw new Error(error.message)

    return {
      data: data ?? [],
      total: count ?? 0,
      page,
      limit,
      hasNextPage: offset + limit < (count ?? 0),
    }
  }

  async findBySlug(slug: string) {
    const { data, error } = await this.supabase.client
      .from('restaurants')
      .select(`
        *,
        region:regions!region_id(*),
        owner:users!owner_id(id, name),
        reviews(id, rating, title, content, visit_date, created_at,
          user:users!user_id(id, name))
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .eq('reviews.status', 'approved')
      .single()

    if (error || !data) throw new NotFoundException(`Restaurant "${slug}" introuvable`)
    return data
  }

  async findFeatured(limit = 6) {
    const { data, error } = await this.supabase.client
      .from('restaurants')
      .select(`
        id, name, slug, short_description, cover_image,
        city, price_range, tags, cuisine_types, is_featured,
        region:regions!region_id(id, name, slug)
      `)
      .eq('status', 'active')
      .eq('is_featured', true)
      .gt('featured_until', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(error.message)
    return data ?? []
  }

  async getSlugs(): Promise<string[]> {
    const { data } = await this.supabase.client
      .from('restaurants')
      .select('slug')
      .eq('status', 'active')
    return (data ?? []).map((r) => r.slug)
  }
}
