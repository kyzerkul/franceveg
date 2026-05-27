import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { UsersService } from '../users/users.service'
import { CreateSubmissionDto } from './dto/create-submission.dto'

@Injectable()
export class SubmissionsService {
  constructor(
    private supabase: SupabaseService,
    private users: UsersService,
  ) {}

  async create(dto: CreateSubmissionDto, clerkId?: string) {
    let submittedBy: string | null = null

    if (clerkId) {
      const user = await this.users.findOrCreateByClerkId(clerkId)
      submittedBy = user.id
    }

    const { data, error } = await this.supabase.client
      .from('restaurant_submissions')
      .insert({ data: dto, submitted_by: submittedBy, status: 'pending' })
      .select('id, status, created_at')
      .single()

    if (error) throw new Error(error.message)
    return data
  }
}
