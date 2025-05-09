import { Logger } from '@nestjs/common'
import {
  IGenericRepository,
  OptionsRepositoryDomain,
  PaginateMetadataDomain,
  PaginateResultDomain,
} from '../../../domain/repository/generic.repository.domain'
import { IReturnDomain } from 'src/shared/domain/entities/return-domain'
import { plainToInstance } from 'class-transformer'
import { Not, Repository } from 'typeorm'

type EntityDomain<T extends any[]> = T[0]
type EntityModel<T extends any[]> = T[1]

export class GenericRepositoryTypeOrm<T extends any[]> implements IGenericRepository<[EntityDomain<T>]> {
  private readonly logger = new Logger('GenericTypeOrmRepository')
  constructor(
    protected _model: Repository<EntityModel<T>>,
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

  mapperModelToDomain(model: any): EntityDomain<T> {
    const modelJson = model?.toJSON ? model.toJSON() : model
    return plainToInstance(this.entityDomain, modelJson) as EntityDomain<T>
  }

  async findOne(query: Record<string, any>): Promise<IReturnDomain<EntityDomain<T>, Error>> {
    const [result, err] = await this.run<EntityModel<T>>(() => this._model.findOneBy(query))

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
    const [result, err] = await this.run<EntityModel<T>>(() => this._model.findOneBy({ _id: id } as any))
    if (err || !result) {
      return [null, err]
    }
    const resultDomain = this.mapperModelToDomain(result)
    return [resultDomain, err]
  }

  async create(data: EntityDomain<T>): Promise<IReturnDomain<EntityDomain<T>, Error>> {
    const dataSanity = this.removeUndefine({ ...data })
    const dataModel = this._model.create(dataSanity)
    const [result, err] = await this.run<EntityModel<T>>(() => this._model.save(dataModel))
    if (err) {
      return [null, err]
    }
    const resultDomain = this.mapperModelToDomain(result)
    return [resultDomain, err]
  }

  async updateById(id: string, data: EntityDomain<T>): Promise<IReturnDomain<EntityDomain<T>, Error>> {
    const dataSanity = this.removeUndefine({ ...data })
    const [dataModel, errFind] = await this.run<EntityModel<T>>(() => this._model.findOneBy({ _id: id } as any))
    if (errFind) {
      return [null, errFind]
    }

    this._model.merge(dataModel, dataSanity)

    const [, err] = await this.run<EntityModel<T>>(() => this._model.save(dataModel))
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
    const [, err] = await this.run<EntityModel<T>>(() => this._model.delete(id))
    if (err) {
      return [null, err]
    }
    return [resultSearch, err]
  }

  async findOneExceptById(id: string, query: Record<string, any>): Promise<IReturnDomain<EntityDomain<T>, Error>> {
    const [result, err] = await this.run<EntityModel<T>>(() => this._model.findOneBy({ id: Not(id), ...query } as any))
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
    const [found, errFound] = await this.run<EntityModel<T>>(() => this._model.findOneBy(query))

    if (errFound) {
      return [null, errFound]
    }

    if (!found) {
      return this.create(data)
    }

    return this.updateById(found._id, data)
  }

  async findOneAndUpdateOne(
    query: Record<string, any>,
    data: EntityDomain<T>,
  ): Promise<IReturnDomain<EntityDomain<T>, Error>> {
    const [found, errFound] = await this.run<EntityModel<T>>(() => this._model.findOneBy(query))

    if (errFound || !found) {
      return [null, errFound]
    }

    return this.updateById(found._id, data)
  }

  // // I can call in service without populate
  // // but with populate only from repository
  async findPaginate<K>(arg?: {
    query?: Record<string, any>
    options?: OptionsRepositoryDomain
    populates?: Record<string, any>[]
    mapperModelToDomain?: (e: any) => K
  }): Promise<IReturnDomain<PaginateResultDomain<K | EntityDomain<T>>, Error>> {
    const { limit, page } = new OptionsRepositoryDomain(arg?.options)
    const query = arg?.query || {}
    const populates = arg?.populates || []
    const mapperModelToDomain = arg?.mapperModelToDomain || null

    const [totalDocs, errCount] = await this.run<number>(() => this._model.count(query))

    if (errCount) {
      return [null, errCount]
    }

    const totalPages = Math.ceil(totalDocs / limit)
    const skip = limit * (page - 1)

    // let findBuild: any = this._model.find(query, {}, { limit: limit, skip })

    // for (const populate of populates) {
    //   findBuild = findBuild.populate(populate)
    // }
    console.log(populates)

    const [result, errFind] = await this.run<EntityModel<T>[]>(() =>
      this._model.find({ where: query, take: limit, skip }),
    )

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

  // // avoid call from service, only call from repository
  // async aggregatePaginate<T>(arg?: {
  //   pipeline?: []
  //   options?: OptionsRepositoryDomain
  // }): Promise<IReturnDomain<PaginateResultDomain<T | EntityDomain<T>>, Error>> {
  //   const { limit, page, sort } = new OptionsRepositoryDomain(arg.options)
  //   const pipeline = arg?.pipeline || []
  //   const pipelineCount = [...pipeline, { $count: 'count' }]
  //   const [resultCount, errCount] = await this.run<[{ count: number }]>(
  //     () => this._model.aggregate(pipelineCount) as any,
  //   )

  //   if (errCount) {
  //     return [null, errCount]
  //   }
  //   const totalDocs = resultCount[0]?.count || 0
  //   const totalPages = Math.ceil(totalDocs / limit)
  //   const skip = limit * (page - 1)

  //   const pipelineQuery = [{ $sort: sort }, ...pipeline, { $skip: skip }, { $limit: limit }] as any
  //   const [data, errFind] = await this.run<T[]>(() => this._model.aggregate(pipelineQuery) as any)

  //   if (errFind) {
  //     return [null, errFind]
  //   }

  //   const metadata: PaginateMetadataDomain = { totalDocs, limit, page, totalPages }
  //   return [
  //     {
  //       metadata,
  //       data: data.map((e) => this.mapperModelToDomain(e)),
  //     },
  //     null,
  //   ]
  // }

  // only call service if join is simply
  async findByIdJoin(arg: {
    id: string
    relations: Record<string, any>[] | string[]
  }): Promise<IReturnDomain<EntityDomain<T>, Error>> {
    const { id, relations } = arg
    console.log(relations)
    return this.findById(id)
  }

  // only call service if join is simply
  async findOneJoin(arg: {
    query: Record<string, any>
    relations: Record<string, any>[] | string[]
  }): Promise<IReturnDomain<EntityDomain<T>, Error>> {
    const { query, relations } = arg
    console.log(relations)
    return this.findOne({ ...query })
  }
}
