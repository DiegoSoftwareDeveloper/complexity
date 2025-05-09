import { Controller, Body, Post, Get, Param, Delete, Query, ParseUUIDPipe, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { QueryPaginationDto } from '../../../../shared/domain/dto/query-pagination.dto'
import { ProductsService } from '../../../applications/services/products/products.service'
import { CreateProductDto } from '../../../domain/dto/create-product.dto'
import { UpdateProductDto } from '../../../domain/dto/update-product.dto'

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly _productsService: ProductsService) {}

  @Get()
  async all(@Query() queryPagination: QueryPaginationDto, @Query('quick-search') quickSearch?: string) {
    return await this._productsService.findCustom({ queryPagination, quickSearch })
  }

  @Post()
  async create(@Body() body: CreateProductDto) {
    return await this._productsService.create({ body })
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return await this._productsService.findById({ id })
  }

  @Put(':id')
  async updateById(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateProductDto) {
    return await this._productsService.updateById({ id, body })
  }

  @Delete(':id')
  async removeById(@Param('id', ParseUUIDPipe) id: string) {
    return await this._productsService.deleteById({ id })
  }
}
