import { Module } from '@nestjs/common'
import { ReviewsController } from './reviews.controller'
import { ReviewsService } from './reviews.service'
import { SupabaseModule } from '../supabase/supabase.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [SupabaseModule, UsersModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
