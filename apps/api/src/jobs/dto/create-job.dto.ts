import { IsString, IsIn, IsOptional, IsUUID, IsDateString } from 'class-validator'

export class CreateJobDto {
  @IsIn(['offer', 'cv'])
  type: 'offer' | 'cv'

  @IsString()
  title: string

  @IsString()
  description: string

  @IsOptional() @IsString()
  location?: string

  @IsOptional() @IsString()
  contract_type?: string

  @IsOptional() @IsUUID()
  restaurant_id?: string

  @IsOptional() @IsDateString()
  expires_at?: string
}
