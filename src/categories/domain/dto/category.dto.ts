import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class CategoryResDto {
  @Expose()
  readonly _id: string

  @Expose()
  readonly name: string

  @Expose()
  readonly normalizedName: string

  @Expose()
  readonly description?: string
}
