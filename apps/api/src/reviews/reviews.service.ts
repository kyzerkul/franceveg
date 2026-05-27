import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { UsersService } from '../users/users.service'
import { CreateReviewDto } from './dto/create-review.dto'

@Injectable()
export class ReviewsService {
  constructor(
    private supabase: SupabaseService,
    private users: UsersService,
  ) {}

  async create(clerkId: string, dto: CreateReviewDto) {
    const user = await this.users.findOrCreateByClerkId(clerkId)

    const { data: restaurant } = await this.supabase.client
      .from('restaurants')
      .select('id')
      .eq('id', dto.restaurant_id)
      .eq('status', 'active')
      .single()

    if (!restaurant) throw new NotFoundException('Restaurant introuvable')

    const { data, error } = await this.supabase.client
      .from('reviews')
      .insert({
        restaurant_id: dto.restaurant_id,
        user_id: user.id,
        rating: dto.rating,
        title: dto.title ?? null,
        content: dto.content,
        visit_date: dto.visit_date ?? null,
        status: 'pending',
      })
      .select('id, rating, title, content, visit_date, created_at, status')
      .single()

    if (error) {
      if (error.code === '23505') throw new ConflictException('Vous avez déjà laissé un avis pour ce restaurant')
      throw new Error(error.message)
    }

    return data
  }
}
