// src/infrastructure/redis/redis-health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RedisHealthService } from '../../redis/redis-health.service';

@ApiTags('Health Check')
@Controller('health/redis')
export class RedisHealthController {
  constructor(private readonly redisHealth: RedisHealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check Redis connection status' })
  @ApiResponse({ status: 200, description: 'Redis is healthy' })
  @ApiResponse({ status: 503, description: 'Redis is unavailable' })
  async checkHealth() {
    const isHealthy = await this.redisHealth.checkConnection();
    
    return {
      status: isHealthy ? 'OK' : 'FAIL',
      service: 'Redis',
      timestamp: new Date().toISOString(),
      response: isHealthy ? 'PONG' : 'Connection failed'
    };
  }
}