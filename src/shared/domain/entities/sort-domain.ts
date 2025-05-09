import { Exclude, Expose } from 'class-transformer'
import { initProp } from '../helpers/init_prop'

export interface ISortDomain {
  field: string
  order: number
}

@Exclude()
export class SortDomain implements ISortDomain {
  @Expose()
  field: string
  @Expose()
  order: number

  constructor(arg?: Partial<ISortDomain>) {
    this.field = initProp(arg?.field)
    this.order = initProp(arg?.order)
  }
}
