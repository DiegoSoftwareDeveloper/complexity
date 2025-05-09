import { Module } from '@nestjs/common'
import { validate } from './shared/domain/dto/environment.validator'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { SharedModule } from './shared/shared.module'
import { envLoader } from './shared/infrastructure/nestjs/env/env-loader'
// import { TypeOrmModule } from '@nestjs/typeorm'
import { ProductsModule } from './products/products.module'

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
    SharedModule,
    ProductsModule,
  ],
  controllers: [],
})
export class AppModule {}
