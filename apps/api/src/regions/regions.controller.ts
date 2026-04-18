import { Controller, Get, Param } from '@nestjs/common'
import { RegionsService } from './regions.service'

@Controller('regions')
export class RegionsController {
  constructor(private readonly service: RegionsService) {}

  @Get()
  findAll() {
    return this.service.findAll()
  }

  @Get('slugs')
  getSlugs() {
    return this.service.getSlugs()
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.service.findBySlug(slug)
  }
}
