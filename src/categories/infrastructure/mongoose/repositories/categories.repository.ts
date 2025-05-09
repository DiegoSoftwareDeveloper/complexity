import { Injectable } from '@nestjs/common'
import { GenericRepositoryMongoose } from '../../../../shared/infrastructure/mongoose/repositories/generic.repository.mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { QueryPaginationDto } from '../../../../shared/domain/dto/query-pagination.dto'
import {
  OptionsRepositoryDomain,
  PaginateResultDomain,
} from '../../../../shared/domain/repository/generic.repository.domain'
import { IReturnDomain } from '../../../../shared/domain/entities/return-domain'
import { UtilsRepository } from '../../../../shared/infrastructure/mongoose/repositories/utils.repository'
import { CategoryEntity } from '../../../domain/entities/category.entity'
import { CategoriesRepositoryDomain } from '../../../domain/repositories/categories.repository.domain'
import { CategorySchemaBaseMongoose } from '../schemas/categories.schema.mongoose'

@Injectable()
export class CategoriesRepositoryMongoose implements CategoriesRepositoryDomain {
  base: GenericRepositoryMongoose<[CategoryEntity, Model<CategorySchemaBaseMongoose>]>
  utils: UtilsRepository

  constructor(@InjectModel('Category') private readonly _model: Model<CategorySchemaBaseMongoose>) {
    this.base = new GenericRepositoryMongoose<[CategoryEntity, Model<CategorySchemaBaseMongoose>]>(
      _model as any,
      CategoryEntity,
    )
    this.utils = new UtilsRepository()
  }

  async findPaginationCustom<K = CategoryEntity>(arg: {
    quickSearch?: string
    queryPagination?: QueryPaginationDto
  }): Promise<IReturnDomain<PaginateResultDomain<K>, Error>> {
    const { quickSearch, queryPagination } = arg

    const pipelineBuilder = this.utils.start()

    if (quickSearch) {
      const searchableFields = ['name', 'normalizedName', 'description']

      const orConditions = searchableFields.map((field) => {
        const condition = { $regex: new RegExp(quickSearch, 'i') }

        return { [field]: condition }
      })

      pipelineBuilder.custom({ $match: { $or: orConditions } })
    }

    const pipeline = pipelineBuilder.build()

    return this.base.rawQueryPaginate({ pipeline, options: new OptionsRepositoryDomain(queryPagination) })
  }
}
