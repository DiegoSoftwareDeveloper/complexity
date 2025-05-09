import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { RedisModule } from '@nestjs-modules/ioredis'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UtilsSharedService } from '../shared/application/services/utils-shared.service'
import { ProductsService } from './applications/services/products/products.service'
import { ProductsSearchRedisService } from './applications/services/products/products-search-redis.service'
import { ProductsController } from './infrastructure/nestjs/controllers/products.controller'
import { ProductsSearchController } from './infrastructure/nestjs/controllers/products-search.controller'
import { ProductsRepositoryDomain } from './domain/repositories/products.repository.domain'
import { ProductsRepositoryMongoose } from './infrastructure/mongoose/repositories/products.repository'
import { ProductSchemaMongoose } from './infrastructure/mongoose/schemas/products.schema.mongoose'
import { RedisHealthService } from './infrastructure/redis/redis-health.service'
import { RedisHealthController } from './infrastructure/nestjs/controllers/redis-health.controller'
import { TerminusModule } from '@nestjs/terminus'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Product',
        schema: ProductSchemaMongoose,
      }
    ]),
    RedisModule,
    TerminusModule,
    ConfigModule, // Necesario para inyección de configuración
  ],
  controllers: [ProductsController, ProductsSearchController, RedisHealthController],
  providers: [
    ProductsService,
    {
      provide: ProductsRepositoryDomain,
      useClass: ProductsRepositoryMongoose,
    },
    {
      provide: 'REDIS_CLIENT', // Proveedor para el cliente Redis
      useFactory: async (config: ConfigService) => {
        const redis = require('ioredis')
        return new redis({
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          lazyConnect: true,
        })
      },
      inject: [ConfigService],
    },
    ProductsSearchRedisService,
    RedisHealthService,
    UtilsSharedService,
  ],
  exports: [
    ProductsService,
    {
      provide: ProductsRepositoryDomain,
      useClass: ProductsRepositoryMongoose,
    },
    ProductsSearchRedisService,
    RedisHealthService,
    MongooseModule,
  ],
})
export class ProductsModule {}
