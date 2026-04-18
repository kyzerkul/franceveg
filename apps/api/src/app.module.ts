import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { SupabaseModule } from './supabase/supabase.module'
import { RestaurantsModule } from './restaurants/restaurants.module'
import { RegionsModule } from './regions/regions.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    SupabaseModule,
    RestaurantsModule,
    RegionsModule,
  ],
})
export class AppModule {}
