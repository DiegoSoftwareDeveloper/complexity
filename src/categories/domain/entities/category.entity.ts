import { Exclude, Expose, Transform } from 'class-transformer'
import { initProp } from '../../../shared/domain/helpers/init_prop'
import { transformIdToString } from '../../../shared/domain/helpers/normalize-id-shared.helper'

export interface ICategoryEntity {
  _id?: string
  name: string
  normalizedName: string
  description?: string
  createdAt?: Date
  updatedAt?: Date
}

@Exclude()
export class CategoryEntity implements ICategoryEntity {
  @Expose()
  @Transform(transformIdToString)
  _id?: string

  @Expose()
  name: string

  @Expose()
  normalizedName: string

  @Expose()
  description?: string

  @Expose()
  createdAt?: Date

  @Expose()
  updatedAt?: Date

  constructor(arg?: Partial<ICategoryEntity>) {
    this._id = initProp(arg?._id)
    this.name = initProp(arg?.name)
    this.normalizedName = initProp(arg?.normalizedName)
    this.description = initProp(arg?.description)
    this.createdAt = initProp(arg?.createdAt)
    this.updatedAt = initProp(arg?.updatedAt)
  }
}
