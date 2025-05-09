import { Logger } from '@nestjs/common'
import { Model } from 'mongoose'
import {
  IGenericRepository,
  PaginateMetadataDomain,
  PaginateResultDomain,
  OptionsRepositoryDomain,
} from '../../../domain/repository/generic.repository.domain'
import { IReturnDomain } from 'src/shared/domain/entities/return-domain'
import { plainToInstance } from 'class-transformer'

type EntityDomain<T extends any[]> = T[0]
type EntityModel<T extends any[]> = T[1]

export class GenericRepositoryMongoose<T extends any[]> implements IGenericRepository<[EntityDomain<T>]> {
  private readonly logger = new Logger('GenericRepository')
  constructor(
    protected _model: Model<EntityModel<T>>,
    private entityDomain: any,
  ) {}

  async run<Result>(command: () => Promise<any>): Promise<IReturnDomain<Result, any>> {
    try {
      const result = await command()
      return [result, null]
    } catch (e) {
      this.logger.error(e)
      return [null, e]
    }
  }

  removeUndefine(obj: any) {
    Object.keys(obj).forEach((key) => (obj[key] === undefined ? delete obj[key] : {}))
    return obj
  }

  private _mapPopulateToFieldVirtual(arg: { relations: string[]; data: EntityModel<T> }) {
    const { relations, data } = arg

    for (const relation of relations) {
      const temp = data[relation]
      data[`_${relation}`] = temp
      data[relation] = temp?._id
    }
  }

  mapperModelToDomain<Entity = EntityDomain<T>>(model: any, arg?: { customMapper?: any; relations?: any[] }): Entity {
    const customMapper = arg?.customMapper
    const relations = arg?.relations
    const modelJson = model?.toJSON ? model.toJSON() : model
    if (customMapper) {
      return plainToInstance(customMapper, modelJson) as Entity
    }

    if (relations) {
      this._mapPopulateToFieldVirtual({ data: modelJson, relations })
    }

    return plainToInstance(this.entityDomain, modelJson) as Entity
  }

  async findOne(query: Record<string, any>): Promise<IReturnDomain<EntityDomain<T>, Error>> {
    const [result, err] = await this.run<EntityModel<T>>(() => this._model.findOne(query))
    if (err || !result) {
      return [null, err]
    }
    const resultDomain = this.mapperModelToDomain(result)
    return [resultDomain, err]
  }

  async find(query?: Record<string, any>): Promise<IReturnDomain<EntityDomain<T>[], Error>> {
    const [result, err] = await this.run<[EntityModel<T>]>(() => this._model.find(query || {}))
    if (err) {
      return [null, err]
    }
    const resultDomain = result.map((e) => this.mapperModelToDomain(e))
    return [resultDomain, err]
  }

  async findById(id: string): Promise<IReturnDomain<EntityDomain<T>, Error>> {
    const [result, err] = await this.run<EntityModel<T>>(() => this._model.findById(id))
    if (err || !result) {
      return [null, err]
    }
    const resultDomain = this.mapperModelToDomain(result)
    return [resultDomain, err]
  }

  async create(data: EntityDomain<T>): Promise<IReturnDomain<EntityDomain<T>, Error>> {
    const dataSanity = this.removeUndefine({ ...data })
    const [result, err] = await this.run<EntityModel<T>>(() => this._model.create(dataSanity))
    if (err) {
      return [null, err]
    }
    const resultDomain = this.mapperModelToDomain(result)
    return [resultDomain, err]
  }

  async updateById(id: string, data: EntityDomain<T>): Promise<IReturnDomain<EntityDomain<T>, Error>> {
    const dataSanity = this.removeUndefine({ ...data })
    const [, err] = await this.run<EntityModel<T>>(() =>
      this._model.updateOne({ _id: id }, { $set: { ...dataSanity } }),
    )
    if (err) {
      return [null, err]
    }
    const [resultUpdated] = await this.findById(id)
    return [resultUpdated, err]
  }

  async deleteById(id: string): Promise<IReturnDomain<EntityDomain<T>, Error>> {
    const [resultSearch, errSearch] = await this.findById(id)
    if (!resultSearch) {
      return [null, errSearch]
    }
    const [, err] = await this.run<EntityModel<T>>(() => this._model.deleteOne({ _id: id }))
    if (err) {
      return [null, err]
    }
    return [resultSearch, err]
  }

  async findOneExceptById(id: string, query: Record<string, any>): Promise<IReturnDomain<EntityDomain<T>, Error>> {
    const [result, err] = await this.run<EntityModel<T>>(() => this._model.findOne({ _id: { $ne: id }, ...query }))
    if (err || !result) {
      return [null, err]
    }
    const resultDomain = this.mapperModelToDomain(result)
    return [resultDomain, err]
  }

  async createOneOrUpdateOne(
    query: Record<string, any>,
    data: EntityDomain<T>,
  ): Promise<IReturnDomain<EntityDomain<T>, Error>> {
    const [result, err] = await this.run<EntityModel<T>>(() =>
      this._model.findOneAndUpdate(query, data, {
        upsert: true, // insert the document if it does not exist
        returnDocument: 'after',
      }),
    )

    if (err || !result) {
      return [null, err]
    }
    const resultDomain = this.mapperModelToDomain(result)
    return [resultDomain, err]
  }

  async findOneAndUpdateOne(
    query: Record<string, any>,
    data: EntityDomain<T>,
  ): Promise<IReturnDomain<EntityDomain<T>, Error>> {
    const [result, err] = await this.run<EntityModel<T>>(() =>
      this._model.findOneAndUpdate(query, data, {
        new: true,
      }),
    )

    if (err || !result) {
      return [null, err]
    }
    const resultDomain = this.mapperModelToDomain(result)
    return [resultDomain, err]
  }

  // // I can call in service without populate
  // // but with populate only from repository
  async findPaginate<K>(arg?: {
    query?: Record<string, any>
    options?: OptionsRepositoryDomain
    populates?: Record<string, any>[] | string[]
    mapperModelToDomain?: (e: any) => K
  }): Promise<IReturnDomain<PaginateResultDomain<K | EntityDomain<T>>, Error>> {
    const { limit, page } = new OptionsRepositoryDomain(arg?.options)
    const query = arg?.query || {}
    const populates = arg?.populates || []
    const mapperModelToDomain = arg?.mapperModelToDomain || null

    const [totalDocs, errCount] = await this.run<number>(() => this._model.countDocuments(query))

    if (errCount) {
      return [null, errCount]
    }

    const totalPages = Math.ceil(totalDocs / limit)
    const skip = limit * (page - 1)

    let findBuild: any = this._model.find(query, {}, { limit: limit, skip })

    for (const populate of populates) {
      findBuild = findBuild.populate(populate)
    }

    const [result, errFind] = await this.run<EntityModel<T>[]>(() => findBuild.exec())

    if (errFind) {
      return [null, errFind]
    }

    const data: any = mapperModelToDomain
      ? result.map((e) => mapperModelToDomain(e))
      : result.map((e) => this.mapperModelToDomain(e))

    const metadata: PaginateMetadataDomain = { totalDocs, limit, page, totalPages }
    return [
      {
        metadata,
        data,
      },
      null,
    ]
  }

  // avoid call from service, only call from repository
  async rawQueryPaginate<K = EntityDomain<T>>(arg?: {
    pipeline?: any[]
    options?: OptionsRepositoryDomain
    customMapper?: any
  }): Promise<IReturnDomain<PaginateResultDomain<K>, Error>> {
    const { limit, page, sort, disableSort } = new OptionsRepositoryDomain(arg.options)
    const sortReBuild = disableSort ? [] : [{ $sort: sort }]
    const pipeline = arg?.pipeline || []
    const pipelineCount = [...pipeline, { $count: 'count' }]
    const [resultCount, errCount] = await this.run<[{ count: number }]>(
      () => this._model.aggregate(pipelineCount) as any,
    )

    if (errCount) {
      return [null, errCount]
    }
    const totalDocs = resultCount[0]?.count || 0
    const totalPages = Math.ceil(totalDocs / limit)
    const skip = limit * (page - 1)

    // const pipelineQuery = [{ $sort: sort }, ...pipeline, { $skip: skip }, { $limit: limit }] as any
    const pipelineQuery = [...pipeline, { $skip: skip }, { $limit: limit }, ...sortReBuild] as any
    const [data, errFind] = await this.run<T[]>(() => this._model.aggregate(pipelineQuery) as any)

    // console.log('data', JSON.stringify(data, null, 2))

    const dataDomain = data.map((e) => this.mapperModelToDomain(e, { customMapper: arg?.customMapper }))
    if (errFind) {
      return [null, errFind]
    }

    // console.log('dataDomain', JSON.stringify(dataDomain, null, 2))

    const metadata: PaginateMetadataDomain = { totalDocs, limit, page, totalPages }
    return [
      {
        metadata,
        data: dataDomain,
      },
      null,
    ]
  }

  // only call service if join is simply
  async findByIdJoin(arg: {
    id: string
    relations: Record<string, any>[] | string[]
  }): Promise<IReturnDomain<EntityDomain<T>, Error>> {
    const { id, relations } = arg

    let findBuild: any = this._model.findById(id)

    for (const populate of relations) {
      findBuild = findBuild.populate(populate)
    }

    const [result, err]: any = await this.run<EntityModel<T>>(() => findBuild.exec())
    if (err || !result) {
      return [null, err]
    }

    const resultDomain = this.mapperModelToDomain(result, { relations })

    return [resultDomain, err]
  }

  // only call service if join is simply
  async findOneJoin(arg: {
    query: Record<string, any>
    relations: Record<string, any>[] | string[]
  }): Promise<IReturnDomain<EntityDomain<T>, Error>> {
    const { query, relations } = arg

    let findBuild: any = this._model.findOne(query)

    for (const populate of relations) {
      findBuild = findBuild.populate(populate)
    }

    const [result, err] = await this.run<EntityModel<T>>(() => findBuild.exec())
    if (err || !result) {
      return [null, err]
    }
    const resultDomain = this.mapperModelToDomain(result, { relations })

    return [resultDomain, err]
  }
}
