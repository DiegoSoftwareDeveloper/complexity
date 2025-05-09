// src/infrastructure/redis/redis-health.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisHealthService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async checkConnection(): Promise<boolean> {
    try {
      return (await this.redis.ping()) === 'PONG';
    } catch (error) {
      console.error('Redis connection error:', error);
      return false;
    }
  }
}