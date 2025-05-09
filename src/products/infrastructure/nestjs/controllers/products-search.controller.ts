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
  @ApiOperation({ summary: 'Search products in Redis' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search term (minimum 3 characters)',
    example: 'iphone',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of matching products',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search query',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async search(@Query('q') query: string) {
    try {
      if (!query || query.trim().length < 3) {
        throw new HttpException('Search query must be at least 3 characters long', HttpStatus.BAD_REQUEST)
      }

      const results = await this._searchService.searchProducts(query)

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

  @Post('reindex')
  @ApiOperation({ summary: 'Rebuild Redis search index' })
  @ApiResponse({
    status: 200,
    description: 'Reindex completed successfully',
  })
  @ApiResponse({
    status: 500,
    description: 'Reindex failed',
  })
  async reindex() {
    try {
      const products = await this._productsService.find()

      // Eliminar datos antiguos primero
      const keys = await this._searchService['redisClient'].keys('products:*')
      if (keys.length > 0) {
        await this._searchService['redisClient'].del(keys)
      }

      // Indexar nuevos productos
      await Promise.all(products.map((product) => this._searchService.indexProduct(product)))

      return {
        success: true,
        message: `Successfully reindexed ${products.length} products`,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Reindex failed',
          message: error.message,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}
