import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { UsersService } from '../users/users.service'
import { QueryJobsDto } from './dto/query-jobs.dto'
import { CreateJobDto } from './dto/create-job.dto'

@Injectable()
export class JobsService {
  constructor(
    private supabase: SupabaseService,
    private users: UsersService,
  ) {}

  async findAll(query: QueryJobsDto) {
    const { page = 1, limit = 20, type, location, contract_type } = query
    const offset = (page - 1) * limit

    let q = this.supabase.client
      .from('jobs')
      .select(
        `id, type, title, description, location, contract_type, expires_at, created_at,
         restaurant:restaurants!restaurant_id(id, name, slug, city, cover_image)`,
        { count: 'exact' },
      )
      .eq('status', 'active')
      .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (type) q = q.eq('type', type)
    if (location) q = q.ilike('location', `%${location}%`)
    if (contract_type) q = q.ilike('contract_type', `%${contract_type}%`)

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

  async findById(id: string) {
    const { data, error } = await this.supabase.client
      .from('jobs')
      .select(
        `*, restaurant:restaurants!restaurant_id(id, name, slug, city, cover_image),
         user:users!user_id(id, name)`,
      )
      .eq('id', id)
      .eq('status', 'active')
      .single()

    if (error || !data) throw new NotFoundException(`Offre "${id}" introuvable`)
    return data
  }

  async create(clerkId: string, dto: CreateJobDto) {
    const user = await this.users.findOrCreateByClerkId(clerkId)

    const { data, error } = await this.supabase.client
      .from('jobs')
      .insert({
        type: dto.type,
        title: dto.title,
        description: dto.description,
        location: dto.location ?? null,
        contract_type: dto.contract_type ?? null,
        restaurant_id: dto.restaurant_id ?? null,
        expires_at: dto.expires_at ?? null,
        user_id: user.id,
        status: 'active',
      })
      .select('id, type, title, status, created_at')
      .single()

    if (error) throw new Error(error.message)
    return data
  }
}
