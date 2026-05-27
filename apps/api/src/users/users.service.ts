import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class UsersService {
  constructor(private supabase: SupabaseService) {}

  async upsertFromClerk(clerkId: string, email: string, name: string | null) {
    const { data, error } = await this.supabase.client
      .from('users')
      .upsert({ clerk_id: clerkId, email, name }, { onConflict: 'clerk_id' })
      .select('id, clerk_id, email, name, role')
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async deleteByClerkId(clerkId: string) {
    await this.supabase.client.from('users').delete().eq('clerk_id', clerkId)
  }

  async findByClerkId(clerkId: string) {
    const { data } = await this.supabase.client
      .from('users')
      .select('id, clerk_id, email, name, role')
      .eq('clerk_id', clerkId)
      .single()
    return data ?? null
  }

  async findOrCreateByClerkId(clerkId: string) {
    const existing = await this.findByClerkId(clerkId)
    if (existing) return existing

    const { data, error } = await this.supabase.client
      .from('users')
      .insert({ clerk_id: clerkId, email: `${clerkId}@clerk.temp`, name: null })
      .select('id, clerk_id, email, name, role')
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async getMyRestaurants(clerkId: string) {
    const user = await this.findByClerkId(clerkId)
    if (!user) return []

    const { data } = await this.supabase.client
      .from('restaurants')
      .select('id, name, slug, city, status, is_featured, cover_image, created_at')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    return data ?? []
  }
}
