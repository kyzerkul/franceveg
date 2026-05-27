import { Module } from '@nestjs/common'
import { ClaimsController } from './claims.controller'
import { ClaimsService } from './claims.service'
import { SupabaseModule } from '../supabase/supabase.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [SupabaseModule, UsersModule],
  controllers: [ClaimsController],
  providers: [ClaimsService],
})
export class ClaimsModule {}
