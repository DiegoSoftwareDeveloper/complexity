import { ApiPropertyOptional } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import { IsNumber, IsOptional } from 'class-validator'

@Exclude()
export class QueryPaginationDto {
  @Expose()
  @IsOptional()
  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }: { value: string }) => (value ? parseInt(value) : 1))
  page: number

  @Expose()
  @IsOptional()
  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }: { value: string }) => (value ? parseInt(value) : 10))
  limit: number
}
