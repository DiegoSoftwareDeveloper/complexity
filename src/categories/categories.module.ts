import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UtilsSharedService } from '../shared/application/services/utils-shared.service'
import { CategoriesController } from './infrastructure/nestjs/controllers/categories.controller'
import { CategoriesService } from './applications/services/categories/categories.service'
import { CategoriesRepositoryDomain } from './domain/repositories/categories.repository.domain'
import { CategoriesRepositoryMongoose } from './infrastructure/mongoose/repositories/categories.repository'
import { CategorySchemaMongoose } from './infrastructure/mongoose/schemas/categories.schema.mongoose'

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Category', schema: CategorySchemaMongoose }])],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    {
      provide: CategoriesRepositoryDomain,
      useClass: CategoriesRepositoryMongoose,
    },
    UtilsSharedService,
  ],

  exports: [
    CategoriesService,
    {
      provide: CategoriesRepositoryDomain,
      useClass: CategoriesRepositoryMongoose,
    },
    MongooseModule,
  ],
})
export class CategoriesModule {}
