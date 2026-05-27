import { Controller, Post, Body, Req, Optional } from '@nestjs/common'
import { SubmissionsService } from './submissions.service'
import { CreateSubmissionDto } from './dto/create-submission.dto'
import { ConfigService } from '@nestjs/config'
import { verifyToken } from '@clerk/backend'
import type { Request } from 'express'

@Controller('submissions')
export class SubmissionsController {
  constructor(
    private readonly service: SubmissionsService,
    private readonly config: ConfigService,
  ) {}

  @Post()
  async create(@Body() dto: CreateSubmissionDto, @Req() req: Request) {
    let clerkId: string | undefined

    const token = req.headers.authorization?.replace('Bearer ', '')
    if (token) {
      try {
        const payload = await verifyToken(token, {
          secretKey: this.config.getOrThrow('CLERK_SECRET_KEY'),
        })
        clerkId = payload.sub
      } catch {
        // soumission anonyme si token invalide
      }
    }

    return this.service.create(dto, clerkId)
  }
}
