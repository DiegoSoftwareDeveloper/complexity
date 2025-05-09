import { Controller, Get, Post, Query, HttpException, HttpStatus } from '@nestjs/common'
import { ProductsSearchRedisService } from '../../../applications/services/products/products-search-redis.service'
import { ProductsService } from '../../../applications/services/products/products.service'
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('Product Search')
@Controller('products-search')
export class ProductsSearchController {
  constructor(
    private readonly _searchService: ProductsSearchRedisService,
    private readonly _productsService: ProductsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Advanced product search' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async search(
    @Query('q') query: string,
    @Query('category') category: string,
    @Query('location') location: string,
    @Query('offset') offset = 0,
    @Query('limit') limit = 10,
  ) {
    try {
      if (!query || query.trim().length < 3) {
        throw new HttpException('Search query must be at least 3 characters long', HttpStatus.BAD_REQUEST)
      }

      const results = await this._searchService.searchProducts(
        query,
        { category, location },
        { offset: Number(offset), limit: Number(limit) },
      )

      return {
        success: true,
        count: results.length,
        data: results,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      throw new HttpException(
        {
          status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Search failed',
          message: error.message,
          timestamp: new Date().toISOString(),
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiQuery({ name: 'q', required: true })
  async getSuggestions(@Query('q') query: string) {
    try {
      const suggestions = await this._searchService.getSuggestions(query)
      return {
        success: true,
        count: suggestions.length,
        data: suggestions,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      // ... manejo de errores
      throw new HttpException(
        {
          status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Search failed',
          message: error.message,
          timestamp: new Date().toISOString(),
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}
