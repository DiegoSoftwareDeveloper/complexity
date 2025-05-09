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

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly category: string

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
