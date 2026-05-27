import { Module } from '@nestjs/common'
import { JobsController } from './jobs.controller'
import { JobsService } from './jobs.service'
import { SupabaseModule } from '../supabase/supabase.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [SupabaseModule, UsersModule],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
