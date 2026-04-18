import { IsOptional, IsString, IsArray, IsInt, Min, Max, IsBoolean } from 'class-validator'
import { Transform, Type } from 'class-transformer'

export class QueryRestaurantsDto {
  @IsOptional() @IsString()
  search?: string

  @IsOptional() @IsString()
  city?: string

  @IsOptional() @IsString()
  region_slug?: string

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray() @IsString({ each: true })
  tags?: string[]

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray() @IsString({ each: true })
  cuisine_types?: string[]

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : [Number(value)]))
  @IsArray() @IsInt({ each: true })
  price_range?: number[]

  @IsOptional() @Type(() => Boolean) @IsBoolean()
  is_featured?: boolean

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number = 20
}
