import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class RegionsService {
  constructor(private supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('regions')
      .select('*')
      .order('type')
      .order('name')
    if (error) throw new Error(error.message)
    return data ?? []
  }

  async findBySlug(slug: string) {
    const { data: region, error } = await this.supabase.client
      .from('regions')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !region) throw new NotFoundException(`Région "${slug}" introuvable`)

    // Children regions
    const { data: children } = await this.supabase.client
      .from('regions')
      .select('id, name, slug, type')
      .eq('parent_id', region.id)
      .order('name')

    // Restaurants in this region (and sub-regions)
    const regionIds = [region.id, ...(children ?? []).map((c) => c.id)]
    const { data: restaurants, count } = await this.supabase.client
      .from('restaurants')
      .select('id, name, slug, short_description, cover_image, city, price_range, tags, is_featured', { count: 'exact' })
      .eq('status', 'active')
      .in('region_id', regionIds)
      .order('is_featured', { ascending: false })
      .order('name')
      .limit(50)

    return { region, children: children ?? [], restaurants: restaurants ?? [], total: count ?? 0 }
  }

  async getSlugs(): Promise<string[]> {
    const { data } = await this.supabase.client
      .from('regions')
      .select('slug, type')
    return (data ?? []).map((r) => r.slug)
  }

  async getCitySlugs(): Promise<{ slug: string; type: string }[]> {
    const { data } = await this.supabase.client
      .from('regions')
      .select('slug, type')
      .in('type', ['city', 'arrondissement'])
    return data ?? []
  }
}
