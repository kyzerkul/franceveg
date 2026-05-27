import { Module } from '@nestjs/common'
import { SubmissionsController } from './submissions.controller'
import { SubmissionsService } from './submissions.service'
import { SupabaseModule } from '../supabase/supabase.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [SupabaseModule, UsersModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
})
export class SubmissionsModule {}
