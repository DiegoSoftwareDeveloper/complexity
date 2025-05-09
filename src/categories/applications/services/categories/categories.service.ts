import { Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { UtilsSharedService } from '../../../../shared/application/services/utils-shared.service'
import { QueryPaginationDto } from '../../../../shared/domain/dto/query-pagination.dto'
import { CategoriesRepositoryDomain } from '../../../domain/repositories/categories.repository.domain'
import { CategoryResDto } from '../../../domain/dto/category.dto'
import { CreateCategoryDto } from '../../../domain/dto/create-category.dto'
import { UpdateCategoryDto } from '../../../domain/dto/update-category.dto'
import { CategoryEntity } from '../../../domain/entities/category.entity'

@Injectable()
export class CategoriesService {
  constructor(
    private readonly _categoriesRepository: CategoriesRepositoryDomain,
    private readonly _utilsSharedService: UtilsSharedService,
  ) {}

  async find(arg: { queryPagination: QueryPaginationDto }) {
    const { queryPagination } = arg

    const [result, err] = await this._categoriesRepository.base.findPaginate({
      options: {
        ...queryPagination,
      },
    })

    this._utilsSharedService.checkErrDatabaseThrowErr({ err })
    result.data = plainToInstance(CategoryResDto, result.data)

    return result
  }

  async findCustom(arg: { queryPagination: QueryPaginationDto; quickSearch?: string }) {
    const { queryPagination, quickSearch } = arg

    const [result, err] = await this._categoriesRepository.findPaginationCustom({
      quickSearch,
      queryPagination,
    })

    this._utilsSharedService.checkErrDatabaseThrowErr({ err })

    const data = plainToInstance(CategoryResDto, result.data)

    return { ...result, data }
  }

  async create(arg: { body: CreateCategoryDto }) {
    const { body } = arg

    const [categoryIdFound, errFoundCategory] = await this._categoriesRepository.base.findById(body._id)

    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errFoundCategory })
    this._utilsSharedService.checkErrIdAlReadyFoundThrowErr({ result: categoryIdFound })

    const [categoryNameFound] = await this._categoriesRepository.base.findOne({ name: body.name })

    this._utilsSharedService.checkErrFieldAlReadyFoundThrowErr({ result: categoryNameFound, field: 'name' })

    const categoryDomain = plainToInstance(CategoryEntity, body)

    const [result, err] = await this._categoriesRepository.base.create(categoryDomain)

    this._utilsSharedService.checkErrDatabaseThrowErr({ err })

    return plainToInstance(CategoryResDto, result)
  }

  async findById(arg: { id: string }): Promise<CategoryResDto> {
    const { id } = arg

    const [result, err] = await this._categoriesRepository.base.findById(id)

    this._utilsSharedService.checkErrDatabaseThrowErr({ err })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result })

    return plainToInstance(CategoryResDto, result)
  }

  async updateById(arg: { id: string; body: UpdateCategoryDto }) {
    const { id, body } = arg

    await this.findById({ id })

    const [categoryNameFound] = await this._categoriesRepository.base.findOneExceptById(id, {
      name: body.name,
    })

    this._utilsSharedService.checkErrFieldAlReadyFoundThrowErr({ result: categoryNameFound, field: 'name' })

    const categoryDomain = plainToInstance(CategoryEntity, body)
    const [result, err] = await this._categoriesRepository.base.updateById(id, categoryDomain)

    this._utilsSharedService.checkErrDatabaseThrowErr({ err })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result })

    return plainToInstance(CategoryResDto, result)
  }

  async deleteById(arg: { id: string }) {
    const { id } = arg

    await this.findById({ id })

    const [result, err] = await this._categoriesRepository.base.deleteById(id)

    this._utilsSharedService.checkErrDatabaseThrowErr({ err })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result })

    return plainToInstance(CategoryResDto, result)
  }
}
