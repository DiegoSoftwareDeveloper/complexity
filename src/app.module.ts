import { Module } from '@nestjs/common'
import { validate } from './shared/domain/dto/environment.validator'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { SharedModule } from './shared/shared.module'
import { envLoader } from './shared/infrastructure/nestjs/env/env-loader'
// import { TypeOrmModule } from '@nestjs/typeorm'
import { ProductsModule } from './products/products.module'
import { CategoriesModule } from './categories/categories.module'
import { RedisModule } from '@nestjs-modules/ioredis'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envLoader(),
      cache: true,
      validate,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('DB_MONGO'),
      }),
    }),
    RedisModule,
    SharedModule,
    ProductsModule,
    CategoriesModule,
  ],
  controllers: [],
})
export class AppModule {}
