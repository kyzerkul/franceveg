import { IsString, IsOptional, IsEmail, IsUrl } from 'class-validator'

export class CreateSubmissionDto {
  @IsString()
  name: string

  @IsString()
  address: string

  @IsString()
  zip_code: string

  @IsString()
  city: string

  @IsOptional() @IsString()
  phone?: string

  @IsOptional() @IsEmail()
  email?: string

  @IsOptional() @IsUrl()
  website?: string

  @IsOptional() @IsString()
  description?: string

  @IsOptional() @IsString({ each: true })
  tags?: string[]

  @IsOptional() @IsString({ each: true })
  cuisine_types?: string[]
}
