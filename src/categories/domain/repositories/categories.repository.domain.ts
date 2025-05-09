import { QueryPaginationDto } from '../../../shared/domain/dto/query-pagination.dto'
import { IReturnDomain } from '../../../shared/domain/entities/return-domain'
import { IGenericRepository, PaginateResultDomain } from '../../../shared/domain/repository/generic.repository.domain'
import { CategoryEntity } from '../entities/category.entity'

export abstract class CategoriesRepositoryDomain {
  abstract base: IGenericRepository<[CategoryEntity]>
  abstract findPaginationCustom<K = CategoryEntity>(arg: {
    quickSearch?: string
    queryPagination?: QueryPaginationDto
  }): Promise<IReturnDomain<PaginateResultDomain<K>, Error>>
}
