import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common'
import { JobsService } from './jobs.service'
import { QueryJobsDto } from './dto/query-jobs.dto'
import { CreateJobDto } from './dto/create-job.dto'
import { ClerkAuthGuard } from '../common/guards/clerk-auth.guard'
import { ClerkUserId } from '../common/decorators/clerk-user-id.decorator'

@Controller('jobs')
export class JobsController {
  constructor(private readonly service: JobsService) {}

  @Get()
  findAll(@Query() query: QueryJobsDto) {
    return this.service.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id)
  }

  @Post()
  @UseGuards(ClerkAuthGuard)
  create(@ClerkUserId() clerkId: string, @Body() dto: CreateJobDto) {
    return this.service.create(clerkId, dto)
  }
}
