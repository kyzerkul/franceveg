import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { SupabaseModule } from './supabase/supabase.module'
import { RestaurantsModule } from './restaurants/restaurants.module'
import { RegionsModule } from './regions/regions.module'
import { UsersModule } from './users/users.module'
import { ReviewsModule } from './reviews/reviews.module'
import { ClaimsModule } from './claims/claims.module'
import { SubmissionsModule } from './submissions/submissions.module'
import { BlogModule } from './blog/blog.module'
import { JobsModule } from './jobs/jobs.module'
import { AdminModule } from './admin/admin.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    SupabaseModule,
    RestaurantsModule,
    RegionsModule,
    UsersModule,
    ReviewsModule,
    ClaimsModule,
    SubmissionsModule,
    BlogModule,
    JobsModule,
    AdminModule,
  ],
})
export class AppModule {}
