import { IsString, IsInt, Min, Max, IsOptional, IsUUID, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateReviewDto {
  @IsUUID()
  restaurant_id: string

  @Type(() => Number)
  @IsInt() @Min(1) @Max(5)
  rating: number

  @IsOptional() @IsString()
  title?: string

  @IsString()
  content: string

  @IsOptional() @IsDateString()
  visit_date?: string
}
