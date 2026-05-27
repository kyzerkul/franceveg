import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'
import { AdminService } from './admin.service'
import { AdminGuard } from '../common/guards/admin.guard'
import { CreateBlogPostDto } from './dto/create-blog-post.dto'
import { UpdateBlogPostDto } from './dto/update-blog-post.dto'

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('stats')
  getStats() {
    return this.service.getStats()
  }

  @Get('restaurants')
  getRestaurants(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    return this.service.getRestaurants(Number(page), Number(limit), status)
  }

  @Patch('restaurants/:id')
  updateRestaurant(
    @Param('id') id: string,
    @Body() body: { status?: string; is_featured?: boolean },
  ) {
    return this.service.updateRestaurant(id, body)
  }

  @Get('claims')
  getClaims(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status = 'pending',
  ) {
    return this.service.getClaims(Number(page), Number(limit), status)
  }

  @Patch('claims/:id')
  updateClaim(
    @Param('id') id: string,
    @Body() body: { action: 'approved' | 'rejected' },
  ) {
    return this.service.updateClaim(id, body.action)
  }

  @Get('reviews')
  getReviews(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status = 'pending',
  ) {
    return this.service.getReviews(Number(page), Number(limit), status)
  }

  @Patch('reviews/:id')
  updateReview(
    @Param('id') id: string,
    @Body() body: { status: 'approved' | 'rejected' },
  ) {
    return this.service.updateReview(id, body.status)
  }

  @Get('users')
  getUsers(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.service.getUsers(Number(page), Number(limit))
  }

  // ─── Blog ─────────────────────────────────────────────────────────────────

  @Get('blog')
  getBlogPosts(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.service.getBlogPosts(Number(page), Number(limit))
  }

  @Get('blog/:id')
  getBlogPost(@Param('id') id: string) {
    return this.service.getBlogPost(id)
  }

  @Post('blog')
  createBlogPost(
    @Body() dto: CreateBlogPostDto,
    @Req() req: Request & { clerkUserId: string },
  ) {
    return this.service.createBlogPost(dto, req.clerkUserId)
  }

  @Patch('blog/:id')
  updateBlogPost(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.service.updateBlogPost(id, dto)
  }

  @Delete('blog/:id')
  deleteBlogPost(@Param('id') id: string) {
    return this.service.deleteBlogPost(id)
  }

  @Post('blog/:id/publish')
  toggleBlogPostPublish(@Param('id') id: string) {
    return this.service.toggleBlogPostPublish(id)
  }
}
