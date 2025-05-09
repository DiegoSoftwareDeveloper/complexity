// src/infrastructure/redis/redis.module.ts
import { Module, Global } from '@nestjs/common'
import { RedisModule as RedisNestModule } from '@nestjs-modules/ioredis'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Global()
@Module({
  imports: [
    RedisNestModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: 'single', // o 'cluster' si usas Redis Cluster
        url: config.get('REDIS_URL'),
        options: {
          lazyConnect: true,
          reconnectOnError: (err) => {
            console.error('Redis connection error:', err)
            return true
          },
        },
      }),
    }),
  ],
  exports: [RedisNestModule],
})
export class RedisModule {}
