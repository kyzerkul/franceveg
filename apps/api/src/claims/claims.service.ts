import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { UsersService } from '../users/users.service'
import { CreateClaimDto } from './dto/create-claim.dto'

@Injectable()
export class ClaimsService {
  constructor(
    private supabase: SupabaseService,
    private users: UsersService,
  ) {}

  async create(clerkId: string, dto: CreateClaimDto) {
    const user = await this.users.findOrCreateByClerkId(clerkId)

    const { data: restaurant } = await this.supabase.client
      .from('restaurants')
      .select('id, name')
      .eq('id', dto.restaurant_id)
      .eq('status', 'active')
      .single()

    if (!restaurant) throw new NotFoundException('Restaurant introuvable')

    const { data, error } = await this.supabase.client
      .from('claims')
      .insert({
        restaurant_id: dto.restaurant_id,
        user_id: user.id,
        message: dto.message ?? null,
        status: 'pending',
      })
      .select('id, status, created_at')
      .single()

    if (error) {
      if (error.code === '23505') throw new ConflictException('Une demande est déjà en cours pour ce restaurant')
      throw new Error(error.message)
    }

    return data
  }
}
