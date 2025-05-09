import { FilterQuery, PipelineStage, Types } from 'mongoose'
import { SortDomain } from '../../../domain/entities/sort-domain'

interface ITransform {
  field: string
  type: string
}
interface IConditions {
  select?: string[]
  exclude?: string[]
  transform?: ITransform[]
}

export interface IUtilsRepository {
  equals?: (params: { filters: FilterQuery<any> }) => any
  or?: (params: { filters: FilterQuery<any> }) => any
  and?: (params: { filters: FilterQuery<any> }) => any
  greaterThan?: (params: { field: string; value: number }) => any
  between?: (params: { field: string; value: number }) => any
  betweenTwoDates?: (params: {
    initialDate: string
    keyInitialDate: string
    endDate: string
    keyEndDate: string
  }) => any
  in?: (params: { field: string; arr: string }) => any
  contains?: (params: { field: string; value: string }) => any
  notNull?: (params: { field: string; exists: boolean }) => any
  startsWith?: (params: { field: string; letter: string }) => any
  endsWith?: (params: { field: string; letter: string }) => any
  match?: (params: { filters: FilterQuery<any> }) => any
  lookup?: (params: any) => any
  add?: (params: { field: string; value: any }) => any
  start: () => IUtilsRepository
  custom: (params: Record<string, any>) => IUtilsRepository
  build: (params: { conditions: IConditions }) => PipelineStage[]
  sort: (params: { field: string; order: 1 | -1 }) => IUtilsRepository
  sortMany: (params: { fields: SortDomain[] }) => IUtilsRepository
  limit: (limit: number) => IUtilsRepository
}

export class UtilsRepository implements IUtilsRepository {
  private pipeline: PipelineStage[] = []

  private transformHandler(field: string, type: string) {
    if (type === 'string') {
      return { $toString: `$${field}` }
    }
  }

  private validateExtraConditions(params: { conditions: IConditions }) {
    const { conditions } = params
    // TO-DO: Improve this handler and the transform handler
    if (conditions.select) {
      const projectConditions = {}
      for (const field of conditions.select) {
        const fieldTransformCondition = conditions.transform?.find((e) => e.field === field)
        projectConditions[field] =
          conditions.transform && fieldTransformCondition
            ? this.transformHandler(field, fieldTransformCondition.type)
            : 1
      }
      this.pipeline.push({ $project: { ...projectConditions } })
    }

    return this.pipeline
  }

  removeUndefined(obj: any) {
    Object.keys(obj).forEach((key) => (obj[key] === undefined ? delete obj[key] : {}))
    return obj
  }

  private getMatchRegex = (value: any, flags = 'i') => new RegExp(value, flags)

  // private const matchObjectField = (objName, field) => '${objName}.${field}';

  private parseFieldsForMatch = (filters: any) => {
    const filterKeys = filters ? Object.keys(filters) : []

    if (filterKeys && filterKeys.length > 0) {
      filterKeys.forEach((key) => {
        const value = filters[key]

        if (typeof value === 'string') {
          if (this.isUUID(value)) {
            filters[key] = new Types.UUID(value)
          } else {
            filters[key] = this.getMatchRegex(value)
          }
        } else {
          filters[key] = value
        }
      })
    }
    return filters ?? {}
  }

  equals(params: { filters: FilterQuery<any> }): any {
    const { filters } = params
    const obj = this.removeUndefined(filters)
    if (Object.keys(obj).length === 0) return this
    const filtersParsed = this.parseFieldsForMatch(obj)
    this.pipeline.push({ $match: filtersParsed })
    return this
  }

  or(params: { filters: FilterQuery<any> }) {
    const { filters } = params
    const obj = this.removeUndefined(filters)
    if (Object.keys(obj).length === 0) return this

    const filtersParsed = this.parseFieldsForMatch(obj)
    const orFilters = []
    for (const key of Object.keys(filtersParsed)) {
      orFilters.push({ [key]: filtersParsed[key] })
    }
    this.pipeline.push({ $match: { $or: orFilters } })
    return this
  }

  and(params: { filters: FilterQuery<any> }) {
    const { filters } = params
    const obj = this.removeUndefined(filters)
    if (Object.keys(obj).length === 0) return this

    const filtersParsed = this.parseFieldsForMatch(obj)
    const andFilters = []
    for (const key of Object.keys(filtersParsed)) {
      andFilters.push({ [key]: filtersParsed[key] })
    }
    this.pipeline.push({ $match: { $and: andFilters } })
    return this
  }

  greaterThan(params: { field: string; value: number }) {
    const { field, value } = params
    this.pipeline.push({ $match: { [field]: { $gte: value } } })
    return this
  }

  between(params: { field: string; value: number }) {
    const { field, value } = params
    this.pipeline.push({ $match: { [field]: { $gte: value, $lte: value } } })
    return this
  }

  betweenTwoDates(params: { initialDate: string; keyInitialDate: string; endDate: string; keyEndDate: string }) {
    const { initialDate, endDate, keyEndDate, keyInitialDate } = params
    this.pipeline.push({ $match: { [keyInitialDate]: { $gte: initialDate }, [keyEndDate]: { $lte: endDate } } })
    return this
  }

  in(params: { field: string; arr: string }): any {
    const { field, arr } = params
    this.pipeline.push({ $match: { [field]: { $in: arr.split(',') } } })
    return this
  }

  notNull(params: { field: string; exists: boolean }): any {
    const { field, exists } = params
    this.pipeline.push({ $match: { [field]: { $exists: exists } } })
    return this
  }

  startsWith(params: { field: string; letter: string }): any {
    const { field, letter } = params
    this.pipeline.push({ $match: { [field]: { $regex: `^${letter}`, $options: 'i' } } })
    return this
  }

  contains(params: { field: string; value: string }): any {
    const { field, value } = params
    this.pipeline.push({ $match: { [field]: { $regex: `.*${value}.*`, $options: 'i' } } })
    return this
  }

  containsManyParams(params: Record<string, boolean | string>): any {
    const matchConditions = {}

    for (const field in params) {
      if (params[field]) {
        const value = params[field]
        if (typeof value === 'string') {
          matchConditions[field] = { $regex: `.*${value}.*`, $options: 'i' }
        } else if (typeof value === 'boolean') {
          matchConditions[field] = value
        }
      }
    }
    this.pipeline.push({ $match: matchConditions })
    return this
  }

  endsWith(params: { field: string; letter: string }): any {
    const { field, letter } = params
    this.pipeline.push({ $match: { [field]: { $regex: `${letter}$`, $options: 'i' } } })
    return this
  }

  match(params: { filters: FilterQuery<any> }) {
    const { filters } = params
    this.pipeline.push({ $match: { ...filters } })
    return this
  }

  lookup(params: {
    from: string
    localField: string
    foreignField: string
    as: string
    unwind: boolean
    conditions?: string
    internalLookup?: any[]
  }) {
    const { from, localField, foreignField, as, unwind, conditions, internalLookup } = params

    // In case they need to apply filters in lookups
    let pipeline = []
    if (conditions) {
      pipeline.push({
        $match: conditions,
      })
    }

    if (internalLookup) {
      pipeline = [...pipeline, ...internalLookup]
    }

    this.pipeline.push({
      $lookup: {
        from,
        localField,
        foreignField,
        pipeline,
        as,
      },
    })

    if (unwind)
      this.pipeline.push({
        $unwind: {
          path: '$' + as,
          preserveNullAndEmptyArrays: true,
        },
      })

    return this
  }

  add(params: { field: string; value: any }) {
    const { field, value } = params
    this.pipeline.push({
      $addFields: {
        [field]: value,
      },
    })

    return this
  }

  start(): UtilsRepository {
    if (this.pipeline.length !== 0) {
      this.pipeline = []
    }

    return this
  }

  build(params?: { conditions?: IConditions }): PipelineStage[] {
    return params?.conditions ? this.validateExtraConditions({ conditions: params.conditions }) : this.pipeline
  }

  custom(params: PipelineStage): UtilsRepository {
    this.pipeline.push(params)
    return this
  }

  // customArray(params: any): UtilsRepository {
  //   this.pipeline.push([...params])
  //   return this
  // }

  sort(params: { field: string; order: 1 | -1 }): UtilsRepository {
    const { field, order } = params
    const sortStage = { $sort: { [field]: order } }
    this.pipeline.push(sortStage)
    return this
  }

  sortMany(params: { fields: SortDomain[] }): UtilsRepository {
    const { fields } = params

    const sortStage = { $sort: {} }

    fields.forEach(({ field, order }) => {
      sortStage.$sort[field] = order
    })

    this.pipeline.push(sortStage)
    return this
  }

  limit(limit: number): UtilsRepository {
    this.pipeline.push({ $limit: limit })
    return this
  }

  private isUUID(value: string): boolean {
    // Valida UUID v4: 8-4-4-4-12 con hexadecimales
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(value)
  }
}
