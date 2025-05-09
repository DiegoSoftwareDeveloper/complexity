import { Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { UtilsSharedService } from '../../../../shared/application/services/utils-shared.service'
import { QueryPaginationDto } from '../../../../shared/domain/dto/query-pagination.dto'
import { ProductsRepositoryDomain } from '../../../domain/repositories/products.repository.domain'
import { ProductResDto } from '../../../domain/dto/product.dto'
import { CreateProductDto } from '../../../domain/dto/create-product.dto'
import { UpdateProductDto } from '../../../domain/dto/update-product.dto'
import { ProductEntity } from '../../../domain/entities/product.entity'
import { ProductsSearchRedisService } from './products-search-redis.service'

@Injectable()
export class ProductsService {
  constructor(
    private readonly _productsRepository: ProductsRepositoryDomain,
    private readonly _productsSearchService: ProductsSearchRedisService,
    private readonly _utilsSharedService: UtilsSharedService,
  ) {}

  async find(arg: { queryPagination: QueryPaginationDto }) {
    const { queryPagination } = arg

    const [result, err] = await this._productsRepository.base.findPaginate({
      options: {
        ...queryPagination,
      },
    })

    this._utilsSharedService.checkErrDatabaseThrowErr({ err })
    result.data = plainToInstance(ProductResDto, result.data)

    return result
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

    await this._productsSearchService.indexProduct(result);
    console.log(`Product ${result._id} indexed in Redis`);
    return plainToInstance(ProductResDto, result);
  }

  async findById(arg: { id: string }): Promise<ProductResDto> {
    const { id } = arg

    const [result, err] = await this._productsRepository.base.findById(id)

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

    await this._productsSearchService.updateProduct(result);
    console.log(`Product ${id} updated in Redis`);
    return plainToInstance(ProductResDto, result);
  }

  async deleteById(arg: { id: string }) {
    const { id } = arg

    await this.findById({ id })

    const [result, err] = await this._productsRepository.base.deleteById(id)

    this._utilsSharedService.checkErrDatabaseThrowErr({ err })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result })

    await this._productsSearchService.deleteProduct(id);
    console.log(`Product ${id} removed from Redis`);
    return plainToInstance(ProductResDto, result);
  }
}
