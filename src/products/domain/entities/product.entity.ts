import { Exclude, Expose, Transform } from 'class-transformer'
import { initProp } from '../../../shared/domain/helpers/init_prop'
import { transformIdToString } from '../../../shared/domain/helpers/normalize-id-shared.helper'

export interface IProductEntity {
  _id?: string
  name: string
  description?: string
  category: string
  price: number
  stock: number
  location: string
  createdAt?: Date
  updatedAt?: Date
}

@Exclude()
export class ProductEntity implements IProductEntity {
  @Expose()
  @Transform(transformIdToString)
  _id?: string

  @Expose()
  name: string

  @Expose()
  description?: string

  @Expose()
  category: string

  @Expose()
  price: number

  @Expose()
  stock: number

  @Expose()
  location: string

  @Expose()
  createdAt?: Date

  @Expose()
  updatedAt?: Date

  constructor(arg?: Partial<IProductEntity>) {
    this._id = initProp(arg?._id)
    this.name = initProp(arg?.name)
    this.description = initProp(arg?.description)
    this.category = initProp(arg?.category)
    this.price = initProp(arg?.price)
    this.stock = initProp(arg?.stock)
    this.location = initProp(arg?.location)
    this.createdAt = initProp(arg?.createdAt)
    this.updatedAt = initProp(arg?.updatedAt)
  }
}
