import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class ProductResDto {
  @Expose()
  readonly _id: string

  @Expose()
  readonly name: string

  @Expose()
  readonly description?: string

  /*@ApiProperty({
    type: [String],
  })
  @IsString()
  @Expose()
  @Type(() => String)
  readonly categories?: string[]*/

  /*@ApiProperty()
  @IsObject()
  @Expose()
  @Type(() => CategoryResDto)
  readonly _categories?: CategoryResDto[]*/

  @Expose()
  readonly category: string

  @Expose()
  readonly price: number

  @Expose()
  readonly stock: number

  @Expose()
  readonly location: string
}
