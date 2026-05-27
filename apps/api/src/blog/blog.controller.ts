import { Controller, Get, Param, Query } from '@nestjs/common'
import { BlogService } from './blog.service'
import { QueryBlogDto } from './dto/query-blog.dto'

@Controller('blog')
export class BlogController {
  constructor(private readonly service: BlogService) {}

  @Get()
  findAll(@Query() query: QueryBlogDto) {
    return this.service.findAll(query)
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
