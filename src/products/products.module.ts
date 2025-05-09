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
import { CategoriesController } from '../categories/infrastructure/nestjs/controllers/categories.controller'
import { CategoriesService } from '../categories/applications/services/categories/categories.service'
import { CategoriesRepositoryDomain } from '../categories/domain/repositories/categories.repository.domain'
import { CategoriesRepositoryMongoose } from '../categories/infrastructure/mongoose/repositories/categories.repository'
import { CategorySchemaMongoose } from '../categories/infrastructure/mongoose/schemas/categories.schema.mongoose'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Product',
        schema: ProductSchemaMongoose,
      },
      {
        name: 'Category',
        schema: CategorySchemaMongoose,
      },
    ]),
    RedisModule,
    ConfigModule, // Necesario para inyección de configuración
  ],
  controllers: [ProductsController, CategoriesController, ProductsSearchController],
  providers: [
    ProductsService,
    {
      provide: ProductsRepositoryDomain,
      useClass: ProductsRepositoryMongoose,
    },
    CategoriesService,
    {
      provide: CategoriesRepositoryDomain,
      useClass: CategoriesRepositoryMongoose,
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
    UtilsSharedService,
  ],
  exports: [
    ProductsService,
    {
      provide: ProductsRepositoryDomain,
      useClass: ProductsRepositoryMongoose,
    },
    ProductsSearchRedisService,
    MongooseModule,
  ],
})
export class ProductsModule {}
