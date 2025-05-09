import { IsOptional, IsString } from 'class-validator'
import { Exclude, Expose } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'

@Exclude()
export class ProductFilterDto {
  @Expose()
  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  category?: string

  @Expose()
  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  location?: string
}
