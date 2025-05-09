import { Controller, Body, Post, Get, Param, Delete, Query, ParseUUIDPipe, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { QueryPaginationDto } from '../../../../shared/domain/dto/query-pagination.dto'
import { CategoriesService } from '../../../applications/services/categories/categories.service'
import { CreateCategoryDto } from '../../../domain/dto/create-category.dto'
import { UpdateCategoryDto } from '../../../domain/dto/update-category.dto'

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly _categoriesService: CategoriesService) {}

  @Get()
  async all(@Query() queryPagination: QueryPaginationDto, @Query('quick-search') quickSearch?: string) {
    return await this._categoriesService.findCustom({ queryPagination, quickSearch })
  }

  @Post()
  async create(@Body() body: CreateCategoryDto) {
    return await this._categoriesService.create({ body })
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return await this._categoriesService.findById({ id })
  }

  @Put(':id')
  async updateById(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateCategoryDto) {
    return await this._categoriesService.updateById({ id, body })
  }

  @Delete(':id')
  async removeById(@Param('id', ParseUUIDPipe) id: string) {
    return await this._categoriesService.deleteById({ id })
  }
}
