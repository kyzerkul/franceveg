import { IsString, IsOptional, IsArray, IsBoolean, MinLength, Matches } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateBlogPostDto {
  @IsString()
  @MinLength(3)
  title: string

  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Le slug ne doit contenir que des lettres minuscules, chiffres et tirets' })
  slug: string

  @IsString()
  @MinLength(1)
  content: string

  @IsOptional()
  @IsString()
  excerpt?: string

  @IsOptional()
  @IsString()
  cover_image?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : []))
  tags?: string[]

  @IsOptional()
  @IsString()
  seo_title?: string

  @IsOptional()
  @IsString()
  seo_description?: string

  @IsOptional()
  @IsBoolean()
  published?: boolean
}
