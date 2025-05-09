import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateCategoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  readonly _id: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly name: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly normalizedName: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly description?: string
}
