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
import { plainToInstance } from 'class-transformer'
import { ProductSchemaBaseMongoose } from '../schemas/products.schema.mongoose'
import { ProductEntity } from '../../../domain/entities/product.entity'
import { ProductsRepositoryDomain } from '../../../domain/repositories/products.repository.domain'

@Injectable()
export class ProductsRepositoryMongoose implements ProductsRepositoryDomain {
  base: GenericRepositoryMongoose<[ProductEntity, Model<ProductSchemaBaseMongoose>]>
  utils: UtilsRepository

  constructor(@InjectModel('Product') private readonly _model: Model<ProductSchemaBaseMongoose>) {
    this.base = new GenericRepositoryMongoose<[ProductEntity, Model<ProductSchemaBaseMongoose>]>(
      _model as any,
      ProductEntity,
    )
    this.utils = new UtilsRepository()
  }

  async findPaginationCustom<K = ProductEntity>(arg: {
    quickSearch?: string
    queryPagination?: QueryPaginationDto
  }): Promise<IReturnDomain<PaginateResultDomain<K>, Error>> {
    const { quickSearch, queryPagination } = arg

    const pipelineBuilder = this.utils.start()

    if (quickSearch) {
      const searchableFields = ['name', 'normalizedName', 'description', 'location']

      const numericToStringFields = ['price', 'stock']

      const orConditions = searchableFields.map((field) => {
        const condition = { $regex: new RegExp(quickSearch, 'i') }

        if (numericToStringFields.includes(field)) {
          return {
            $expr: {
              $regexMatch: {
                input: { $toString: `$${field}` },
                regex: quickSearch,
                options: 'i',
              },
            },
          }
        }

        return { [field]: condition }
      })

      pipelineBuilder.custom({ $match: { $or: orConditions } })
    }

    pipelineBuilder.lookup({
      from: 'categories',
      localField: 'categories',
      foreignField: '_id',
      as: '_categories',
      unwind: false,
    })

    const pipeline = pipelineBuilder.build()

    return this.base.rawQueryPaginate({
      pipeline,
      options: new OptionsRepositoryDomain(queryPagination),
    })
  }

  async findByIdWithCategories(id: string): Promise<IReturnDomain<ProductEntity, Error>> {
    const pipeline = this.utils
      .start()
      .equals({ filters: { _id: id } })
      .lookup({
        from: 'categories',
        localField: 'categories',
        foreignField: '_id',
        as: '_categories',
      })
      .build()

    const [result, error] = await this.base.run(() => this._model.aggregate(pipeline) as any)

    const dataDomain = plainToInstance(ProductEntity, result[0])

    return [dataDomain, error]
  }

  async findWithCategories(): Promise<IReturnDomain<ProductEntity[], Error>> {
    const pipeline = this.utils
      .start()
      .lookup({
        from: 'categories',
        localField: 'categories',
        foreignField: '_id',
        as: '_categories',
        unwind: false,
      })
      .build()

    const [result, error] = await this.base.run(() => this._model.aggregate(pipeline) as any)

    const resultsArray = Array.isArray(result) ? result : [result]

    const dataDomain = plainToInstance(ProductEntity, resultsArray)

    return [dataDomain, error]
  }
}
