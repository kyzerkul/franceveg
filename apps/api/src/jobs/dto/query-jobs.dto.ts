import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator'
import { Type } from 'class-transformer'

export class QueryJobsDto {
  @IsOptional() @IsIn(['offer', 'cv'])
  type?: 'offer' | 'cv'

  @IsOptional() @IsString()
  location?: string

  @IsOptional() @IsString()
  contract_type?: string

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50)
  limit?: number = 20
}
