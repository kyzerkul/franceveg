import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SupabaseService } from './supabase.service'

@Global()
@Module({
  providers: [
    {
      provide: SupabaseService,
      useFactory: (config: ConfigService) => new SupabaseService(config),
      inject: [ConfigService],
    },
  ],
  exports: [SupabaseService],
})
export class SupabaseModule {}
