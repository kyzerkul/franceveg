import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { QueryBlogDto } from './dto/query-blog.dto'

@Injectable()
export class BlogService {
  constructor(private supabase: SupabaseService) {}

  async findAll(query: QueryBlogDto) {
    const { page = 1, limit = 10, tag } = query
    const offset = (page - 1) * limit
    const now = new Date().toISOString()

    let q = this.supabase.client
      .from('blog_posts')
      .select(
        'id, title, slug, excerpt, cover_image, published_at, tags, author:users!author_id(id, name)',
        { count: 'exact' },
      )
      .not('published_at', 'is', null)
      .lte('published_at', now)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (tag) q = q.contains('tags', [tag])

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
    const now = new Date().toISOString()
    const { data, error } = await this.supabase.client
      .from('blog_posts')
      .select('*, author:users!author_id(id, name)')
      .eq('slug', slug)
      .not('published_at', 'is', null)
      .lte('published_at', now)
      .single()

    if (error || !data) throw new NotFoundException(`Article "${slug}" introuvable`)
    return data
  }

  async getSlugs(): Promise<string[]> {
    const now = new Date().toISOString()
    const { data } = await this.supabase.client
      .from('blog_posts')
      .select('slug')
      .not('published_at', 'is', null)
      .lte('published_at', now)
    return (data ?? []).map((p) => p.slug)
  }
}
