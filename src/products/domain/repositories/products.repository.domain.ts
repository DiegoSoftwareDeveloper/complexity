import { QueryPaginationDto } from '../../../shared/domain/dto/query-pagination.dto'
import { IReturnDomain } from '../../../shared/domain/entities/return-domain'
import { IGenericRepository, PaginateResultDomain } from '../../../shared/domain/repository/generic.repository.domain'
import { ProductEntity } from '../entities/product.entity'

export abstract class ProductsRepositoryDomain {
  abstract base: IGenericRepository<[ProductEntity]>
  abstract findPaginationCustom<K = ProductEntity>(arg: {
    quickSearch?: string
    queryPagination?: QueryPaginationDto
  }): Promise<IReturnDomain<PaginateResultDomain<K>, Error>>
}
