import { IsUUID, IsOptional, IsString } from 'class-validator'

export class CreateClaimDto {
  @IsUUID()
  restaurant_id: string

  @IsOptional() @IsString()
  message?: string
}
