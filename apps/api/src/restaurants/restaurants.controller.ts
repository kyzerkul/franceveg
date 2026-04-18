import { Controller, Get, Param, Query } from '@nestjs/common'
import { RestaurantsService } from './restaurants.service'
import { QueryRestaurantsDto } from './dto/query-restaurants.dto'

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly service: RestaurantsService) {}

  @Get()
  findAll(@Query() query: QueryRestaurantsDto) {
    return this.service.findAll(query)
  }

  @Get('featured')
  findFeatured() {
    return this.service.findFeatured()
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
