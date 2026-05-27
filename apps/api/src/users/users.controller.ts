import {
  Controller, Post, Get, Headers, Req, HttpCode, UseGuards, BadRequestException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Webhook } from 'svix'
import type { RawBodyRequest } from '@nestjs/common'
import type { Request } from 'express'
import { UsersService } from './users.service'
import { ClerkAuthGuard } from '../common/guards/clerk-auth.guard'
import { ClerkUserId } from '../common/decorators/clerk-user-id.decorator'

type ClerkEvent = {
  type: string
  data: { id: string; email_addresses: { email_address: string }[]; first_name?: string; last_name?: string }
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly service: UsersService,
    private readonly config: ConfigService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  async clerkWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    const secret = this.config.getOrThrow('CLERK_WEBHOOK_SECRET')
    const wh = new Webhook(secret)

    let evt: ClerkEvent
    try {
      evt = wh.verify(req.rawBody as Buffer, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkEvent
    } catch {
      throw new BadRequestException('Signature webhook invalide')
    }

    const { type, data } = evt
    const email = data.email_addresses?.[0]?.email_address ?? ''
    const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || null

    if (type === 'user.created' || type === 'user.updated') {
      await this.service.upsertFromClerk(data.id, email, name)
    } else if (type === 'user.deleted') {
      await this.service.deleteByClerkId(data.id)
    }

    return { received: true }
  }

  @Get('me')
  @UseGuards(ClerkAuthGuard)
  async getMe(@ClerkUserId() clerkId: string) {
    return this.service.findByClerkId(clerkId)
  }

  @Get('me/restaurants')
  @UseGuards(ClerkAuthGuard)
  async getMyRestaurants(@ClerkUserId() clerkId: string) {
    return this.service.getMyRestaurants(clerkId)
  }
}
