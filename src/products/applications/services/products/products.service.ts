import { BadRequestException, Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { UtilsSharedService } from '../../../../shared/application/services/utils-shared.service'
import { QueryPaginationDto } from '../../../../shared/domain/dto/query-pagination.dto'
import { ProductsRepositoryDomain } from '../../../domain/repositories/products.repository.domain'
import { ProductResDto } from '../../../domain/dto/product.dto'
import { CreateProductDto } from '../../../domain/dto/create-product.dto'
import { UpdateProductDto } from '../../../domain/dto/update-product.dto'
import { ProductEntity } from '../../../domain/entities/product.entity'
import { CategoriesService } from '../../../../categories/applications/services/categories/categories.service'

@Injectable()
export class ProductsService {
  constructor(
    private readonly _productsRepository: ProductsRepositoryDomain,
    private readonly _categoriesService: CategoriesService,
    private readonly _utilsSharedService: UtilsSharedService,
  ) {}

  async find() {
    const [result, err] = await this._productsRepository.findWithCategories()

    this._utilsSharedService.checkErrDatabaseThrowErr({ err })

    const productsArray = Array.isArray(result) ? result : [result]
    const data = plainToInstance(ProductEntity, productsArray)

    console.log(data)

    console.log(typeof data)
    console.log(typeof result)

    return data
  }

  async findCustom(arg: { queryPagination: QueryPaginationDto; quickSearch?: string }) {
    const { queryPagination, quickSearch } = arg

    const [result, err] = await this._productsRepository.findPaginationCustom({
      quickSearch,
      queryPagination,
    })

    this._utilsSharedService.checkErrDatabaseThrowErr({ err })

    const data = plainToInstance(ProductResDto, result.data)

    return { ...result, data }
  }

  async create(arg: { body: CreateProductDto }) {
    const { body } = arg

    const [productIdFound, errFoundProduct] = await this._productsRepository.base.findById(body._id)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errFoundProduct })
    this._utilsSharedService.checkErrIdAlReadyFoundThrowErr({ result: productIdFound })

    const [productNameFound] = await this._productsRepository.base.findOne({ name: body.name })
    this._utilsSharedService.checkErrFieldAlReadyFoundThrowErr({ result: productNameFound, field: 'name' })

    const productDomain = plainToInstance(ProductEntity, body)
    const [result, err] = await this._productsRepository.base.create(productDomain)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err })

    return plainToInstance(ProductResDto, result)
  }

  async findById(arg: { id: string }): Promise<ProductResDto> {
    const { id } = arg

    const [result, err] = await this._productsRepository.findByIdWithCategories(id)

    this._utilsSharedService.checkErrDatabaseThrowErr({ err })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result })

    return plainToInstance(ProductResDto, result)
  }

  async updateById(arg: { id: string; body: UpdateProductDto }) {
    const { id, body } = arg

    await this.findById({ id })

    const [productNameFound] = await this._productsRepository.base.findOneExceptById(id, {
      name: body.name,
    })

    this._utilsSharedService.checkErrFieldAlReadyFoundThrowErr({ result: productNameFound, field: 'name' })

    const productDomain = plainToInstance(ProductEntity, body)
    const [result, err] = await this._productsRepository.base.updateById(id, productDomain)

    this._utilsSharedService.checkErrDatabaseThrowErr({ err })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result })

    return plainToInstance(ProductResDto, result)
  }

  async deleteById(arg: { id: string }) {
    const { id } = arg

    await this.findById({ id })

    const [result, err] = await this._productsRepository.base.deleteById(id)

    this._utilsSharedService.checkErrDatabaseThrowErr({ err })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result })

    return plainToInstance(ProductResDto, result)
  }
}
