import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { ClaimsService } from './claims.service'
import { CreateClaimDto } from './dto/create-claim.dto'
import { ClerkAuthGuard } from '../common/guards/clerk-auth.guard'
import { ClerkUserId } from '../common/decorators/clerk-user-id.decorator'

@Controller('claims')
export class ClaimsController {
  constructor(private readonly service: ClaimsService) {}

  @Post()
  @UseGuards(ClerkAuthGuard)
  create(@ClerkUserId() clerkId: string, @Body() dto: CreateClaimDto) {
    return this.service.create(clerkId, dto)
  }
}
