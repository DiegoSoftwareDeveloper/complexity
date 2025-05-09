import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class ProductResDto {
  @Expose()
  readonly _id: string

  @Expose()
  readonly name: string

  @Expose()
  readonly description?: string

  @Expose()
  readonly category: string

  @Expose()
  readonly price: number

  @Expose()
  readonly stock: number

  @Expose()
  readonly location: string
}
