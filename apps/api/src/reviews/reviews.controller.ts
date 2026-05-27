import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { ReviewsService } from './reviews.service'
import { CreateReviewDto } from './dto/create-review.dto'
import { ClerkAuthGuard } from '../common/guards/clerk-auth.guard'
import { ClerkUserId } from '../common/decorators/clerk-user-id.decorator'

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @Post()
  @UseGuards(ClerkAuthGuard)
  create(@ClerkUserId() clerkId: string, @Body() dto: CreateReviewDto) {
    return this.service.create(clerkId, dto)
  }
}
