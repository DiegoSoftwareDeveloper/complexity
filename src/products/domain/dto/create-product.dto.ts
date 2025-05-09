import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateProductDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  readonly _id: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly name: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  readonly description?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  readonly category?: string

  /*@ApiPropertyOptional({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @IsUUID('all', { each: true })
  readonly categories?: string[]*/

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly price: number

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly stock: number

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly location: string
}
