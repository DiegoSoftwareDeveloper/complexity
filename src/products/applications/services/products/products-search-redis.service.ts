import { Injectable, Inject } from '@nestjs/common'
import { Redis } from 'ioredis'
import { ProductEntity } from '../../../domain/entities/product.entity'

@Injectable()
export class ProductsSearchRedisService {
  private readonly INDEX_NAME = 'productsIndex'
  private readonly SUGGESTION_KEY = 'productNames'

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {
    this.createIndex()
  }

  private async createIndex() {
    try {
      await this.redisClient.call(
        'FT.CREATE',
        this.INDEX_NAME,
        'ON',
        'HASH',
        'PREFIX',
        '1',
        'product:',
        'SCHEMA',
        'name',
        'TEXT',
        'WEIGHT',
        '5.0',
        'NOSTEM',
        'description',
        'TEXT',
        'category',
        'TAG',
        'CASESENSITIVE',
        'location',
        'TAG',
        'price',
        'NUMERIC',
        'SORTABLE',
        'stock',
        'NUMERIC',
        'createdAt',
        'NUMERIC',
        'SORTABLE',
      )
    } catch (error) {
      if (!error.message.includes('Index already exists')) {
        throw error
      }
    }
  }

  async indexProduct(product: ProductEntity): Promise<void> {
    const key = `product:${product._id}`
    await this.redisClient
      .multi()
      .hset(key, {
        id: product._id,
        name: product.name,
        description: product.description || '',
        category: product.category,
        location: product.location,
        price: product.price.toString(),
        stock: product.stock.toString(),
        createdAt: product.createdAt.getTime().toString(),
      })
      .call('FT.SUGADD', this.SUGGESTION_KEY, product.name, 1)
      .exec()
  }

  async searchProducts(
    query: string,
    filters: { category?: string; location?: string },
    pagination: { offset: number; limit: number },
  ): Promise<any[]> {
    let searchQuery = `@name:(${query}*) | @description:(${query}*)`
    const filterParts = []

    if (filters.category) filterParts.push(`@category:{${filters.category}}`)
    if (filters.location) filterParts.push(`@location:{${filters.location}}`)

    if (filterParts.length > 0) {
      searchQuery += ` ${filterParts.join(' ')}`
    }

    const rawResults = (await this.redisClient.call(
      'FT.SEARCH',
      this.INDEX_NAME,
      searchQuery,
      'LIMIT',
      pagination.offset.toString(),
      pagination.limit.toString(),
      'SORTBY',
      'createdAt',
      'DESC',
    )) as unknown[]

    return this.parseSearchResults(rawResults)
  }

  async getSuggestions(query: string, limit = 5): Promise<string[]> {
    return this.redisClient.call('FT.SUGGET', this.SUGGESTION_KEY, query, 'FUZZY', 'MAX', limit.toString()) as Promise<
      string[]
    >
  }

  private parseSearchResults(rawResults: unknown[]): any[] {
    const results = []
    for (let i = 1; i < rawResults.length; i += 2) {
      const productData = rawResults[i + 1] as string[]
      const product = { id: rawResults[i] }
      for (let j = 0; j < productData.length; j += 2) {
        product[productData[j]] = productData[j + 1]
      }
      results.push(product)
    }
    return results
  }

  async updateProduct(product: ProductEntity): Promise<void> {
    await this.indexProduct(product)
  }

  async deleteProduct(id: string): Promise<void> {
    await this.redisClient.del(`product:${id}`)
    await this.redisClient.call('FT.SUGDEL', this.SUGGESTION_KEY, id)
  }
}
