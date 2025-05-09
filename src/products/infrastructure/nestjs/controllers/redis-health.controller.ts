// src/infrastructure/redis/redis-health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RedisHealthService } from '../../redis/redis-health.service';

@ApiTags('System Health')
@Controller('health-redis')
export class RedisHealthController {
  constructor(
    private readonly _health: HealthCheckService,
    private readonly _redisHealth: RedisHealthService
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ 
    summary: 'Estado de salud de Redis',
    description: 'Verifica la conexión y rendimiento de Redis'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Redis funciona correctamente',
    schema: {
      example: {
        status: 'ok',
        info: {
          redis: { status: 'up', responseTime: '2ms' }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 503, 
    description: 'Redis no está disponible',
    schema: {
      example: {
        status: 'error',
        error: {
          redis: { 
            status: 'down', 
            error: 'Connection failed', 
            message: 'Could not connect' 
          }
        }
      }
    }
  })
  async checkHealth() {
    return this._health.check([
      () => this._redisHealth.isHealthy('redis-db')
    ]);
  }

  @Get('metrics')
  @ApiOperation({ 
    summary: 'Métricas detalladas de Redis',
    description: 'Obtiene estadísticas de rendimiento y uso'
  })
  async getMetrics() {
    return this._redisHealth.getDetailedMetrics();
  }
}