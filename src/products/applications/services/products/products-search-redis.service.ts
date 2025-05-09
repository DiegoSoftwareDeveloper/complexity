// src/applications/services/products-search-redis.service.ts
import { Injectable, Inject } from '@nestjs/common'
import { Redis } from 'ioredis'
import { ProductEntity } from '../../../domain/entities/product.entity'

@Injectable()
export class ProductsSearchRedisService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
  ) {}

  async indexProduct(product: ProductEntity): Promise<void> {
    await this.redisClient.hset(
      `products:${product._id}`,
      'id',
      product._id,
      'name',
      product.name,
      'description',
      product.description,
      'price',
      product.price,
      'stock',
      product.stock,
      'location',
      product.location,
      'createdAt',
      product.createdAt.toISOString(),
    )
  }

  async searchProducts(query: string): Promise<any[]> {
    // Implementa tu lógica de búsqueda aquí
    // Ejemplo básico:
    const keys = await this.redisClient.keys('products:*')
    const products = await Promise.all(keys.map((key) => this.redisClient.hgetall(key)))
    return products.filter((p) => p.name.includes(query) || p.description.includes(query))
  }
}
