import { IReturnDomain } from '../entities/return-domain'

type EntityDomain<T extends any[]> = T[0]

export abstract class IGenericRepository<T extends any[]> {
  abstract findOneExceptById(id: string, query: Record<string, any>): Promise<IReturnDomain<EntityDomain<T>, Error>>
  abstract findById(id: string): Promise<IReturnDomain<EntityDomain<T>, Error>>
  abstract deleteById(id: string): Promise<IReturnDomain<EntityDomain<T>, Error>>
  abstract updateById(id: string, data: EntityDomain<T>): Promise<IReturnDomain<EntityDomain<T>, Error>>
  abstract create(data: EntityDomain<T>): Promise<IReturnDomain<EntityDomain<T>, Error>>
  abstract find(): Promise<IReturnDomain<EntityDomain<T>[], Error>>
  abstract findOne(query: Record<string, any>): Promise<IReturnDomain<EntityDomain<T>, Error>>

  abstract createOneOrUpdateOne(
    query: Record<string, any>,
    data: EntityDomain<T>,
  ): Promise<IReturnDomain<EntityDomain<T>, Error>>

  abstract findOneAndUpdateOne(
    query: Record<string, any>,
    data: EntityDomain<T>,
  ): Promise<IReturnDomain<EntityDomain<T>, Error>>

  abstract findPaginate<K>(arg?: {
    query?: Record<string, any>
    options?: OptionsRepositoryDomain
    populates?: []
    mapperModelToDomain?: (e: any) => K
  }): Promise<IReturnDomain<PaginateResultDomain<K | EntityDomain<T>>, Error>>

  // abstract aggregatePaginate<T>(arg?: {
  //   pipeline?: []
  //   options?: OptionsRepositoryDomain
  // }): Promise<IReturnDomain<PaginateResultDomain<T | EntityDomain>, Error>>

  // abstract aggregatePaginate<T>(arg?: {
  //     pipeline?: []
  //     options?: PaginationDomain
  //   }): Promise<IReturnDomain<PaginateResultDomain<T | EntityDomain>, Error>>

  abstract findByIdJoin(arg: {
    id: string
    relations: Record<string, any>[] | string[]
  }): Promise<IReturnDomain<EntityDomain<T>, Error>>

  abstract findOneJoin(arg: {
    query: Record<string, any>
    relations: Record<string, any>[] | string[]
  }): Promise<IReturnDomain<EntityDomain<T>, Error>>
}

export class OptionsRepositoryDomain {
  limit?: number
  page?: number
  sort?: Record<string, number>
  disableSort?: boolean

  constructor(arg?: OptionsRepositoryDomain) {
    const limit = arg?.limit || 200
    const page = arg?.page || 1
    // valid negative
    this.limit = limit < 0 ? 200 : limit
    this.page = page < 0 ? 1 : page
    this.sort = arg?.sort || {
      _id: -1,
    }
  }
}

export interface PaginateMetadataDomain {
  totalDocs: number
  limit: number
  page: number
  totalPages: number
}

export interface PaginateResultDomain<Result> {
  metadata: PaginateMetadataDomain
  data: Result[]
}
